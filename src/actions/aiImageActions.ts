"use server";

import { generateImageFromPrompt } from "@/ai/flows/generate-image-from-prompt";
import { enhanceImageQuality } from "@/ai/flows/enhance-image-quality";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const GENERATION_COST = 1; 
const MAX_RETRIES = 2; 

const GenerateImageInputSchema = z.object({
  prompt: z.string(),
});

const EnhanceImageInputSchema = z.object({
  photoDataUri: z.string().startsWith("data:image/", { message: "Photo must be a valid data URI for an image." }),
});

async function supabaseRetry<T>(operation: () => Promise<{ data: T | null; error: any }>, retries = MAX_RETRIES): Promise<{ data: T | null; error: any }> {
  let attempt = 0;
  while (attempt <= retries) { // use <= to allow initial attempt + retries
    const result = await operation();
    if (!result.error) {
      return result;
    }
    attempt++;
    if (attempt > retries) { // if all attempts failed
      console.error(`Supabase operation failed after ${attempt} attempts:`, result.error);
      return result; 
    }
    console.warn(`Supabase operation attempt ${attempt} failed with message "${result.error.message}", retrying...`);
    await new Promise(resolve => setTimeout(resolve, 500 * attempt));
  }
  // This line should ideally not be reached due to the loop condition.
  return { data: null, error: { message: "Max retries reached for Supabase operation (unexpected)." } };
}


export async function generateImageWithAI(input: z.infer<typeof GenerateImageInputSchema>) {
  const validatedInput = GenerateImageInputSchema.safeParse(input);
  if (!validatedInput.success) {
    return { error: "Invalid input: " + validatedInput.error.flatten().fieldErrors.prompt?.join(', ') };
  }
  const { prompt } = validatedInput.data;

  const cookieStore = cookies();
  const supabaseUserClient = createSupabaseServerClient(cookieStore); 
  
  const { data: { session } } = await supabaseUserClient.auth.getSession();
  if (!session?.user) {
    return { error: "User not authenticated." };
  }
  const userId = session.user.id;

  const profileResult = await supabaseRetry(async () => 
    supabaseUserClient
      .from('user_profiles')
      .select('weekly_generations_remaining')
      .eq('user_id', userId)
      .single()
  );

  if (profileResult.error || !profileResult.data) {
    console.error("Error fetching user profile for generation:", profileResult.error);
    return { error: `Could not retrieve user profile information. ${profileResult.error?.message || ''}` };
  }
  const currentProfile = profileResult.data;

  if (currentProfile.weekly_generations_remaining < GENERATION_COST) {
    return { error: "Not enough generations remaining this week." };
  }

  const newRemaining = currentProfile.weekly_generations_remaining - GENERATION_COST;
  const updateResult = await supabaseRetry(async () => 
    supabaseUserClient
      .from('user_profiles')
      .update({ weekly_generations_remaining: newRemaining })
      .eq('user_id', userId)
  );

  if (updateResult.error) {
    console.error("Error updating generation count:", updateResult.error);
    return { error: `Failed to update generation count. Please try again. ${updateResult.error.message}` };
  }

  let aiResult;
  try {
    aiResult = await generateImageFromPrompt({ prompt });
  } catch (aiError: any) {
    console.error("AI image generation failed:", aiError);
    await supabaseRetry(async () => 
      supabaseUserClient
        .from('user_profiles')
        .update({ weekly_generations_remaining: currentProfile.weekly_generations_remaining }) 
        .eq('user_id', userId)
    );
    return { error: `AI generation failed: ${aiError.message || "Unknown AI error"}` };
  }
  
  const imageUrl = aiResult.imageUrl;
  if (!imageUrl) {
     await supabaseRetry(async () => 
        supabaseUserClient
        .from('user_profiles')
        .update({ weekly_generations_remaining: currentProfile.weekly_generations_remaining })
        .eq('user_id', userId)
    );
    return { error: "AI did not return an image URL." };
  }

  const historyResult = await supabaseRetry(async () => 
    supabaseUserClient.from('generations').insert({
      user_id: userId,
      prompt_text: prompt,
      image_url: imageUrl, 
      model_used: "gemini-2.0-flash-exp", 
    })
  );

  if (historyResult.error) {
    console.error("Error saving generation history:", historyResult.error);
    // Log, but don't fail the whole process.
  }
  
  revalidatePath('/generate'); 
  revalidatePath('/history');  

  return { imageUrl, newRemainingGenerations: newRemaining, error: null };
}


export async function enhanceImageWithAI(input: z.infer<typeof EnhanceImageInputSchema>) {
  const validatedInput = EnhanceImageInputSchema.safeParse(input);
  if (!validatedInput.success) {
    return { error: "Invalid input for enhancement: " + validatedInput.error.flatten().fieldErrors.photoDataUri?.join(', ') };
  }
  const { photoDataUri } = validatedInput.data;

  // Optional: Check user auth if enhancement should be restricted
  // const cookieStore = cookies();
  // const supabaseUserClient = createSupabaseServerClient(cookieStore);
  // const { data: { session } } = await supabaseUserClient.auth.getSession();
  // if (!session?.user) {
  //   return { error: "User not authenticated for enhancement." };
  // }

  try {
    const { enhancedPhotoDataUri } = await enhanceImageQuality({ photoDataUri });
    if (!enhancedPhotoDataUri) {
      return { error: "AI did not return an enhanced image." };
    }
    return { enhancedPhotoDataUri, error: null };
  } catch (aiError: any) {
    console.error("AI image enhancement failed:", aiError);
    return { error: `AI enhancement failed: ${aiError.message || "Unknown AI error"}` };
  }
}

export async function resetWeeklyLimits() {
  const supabaseAdmin = createSupabaseServiceRoleClient(); 
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .update({ 
        weekly_generations_remaining: 50,
        last_generation_reset_at: new Date().toISOString() 
    })
    .neq('user_id', ''); // Placeholder for applying to all users; specific conditions might be better.

  if (error) {
    console.error("Error resetting weekly limits:", error);
    return { error: "Failed to reset limits." };
  }
  // `data` might be null or an empty array for a bulk update depending on `Prefer: return=representation/minimal`
  console.log("Weekly generation limits reset request processed.");
  return { message: "Limits reset.", error: null };
}

