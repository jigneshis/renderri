import Header from "@/components/layout/Header";
import GenerateForm from "./GenerateForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

async function getUserGenerationInfo() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return { remaining: 0, error: "User not authenticated" };
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('weekly_generations_remaining')
    .eq('user_id', session.user.id)
    .single();

  if (error) {
    console.error("Error fetching generation info:", error.message);
    // Attempt to create profile if it doesn't exist (e.g. for users created before profile logic or after email confirm)
    if (error.code === 'PGRST116') { // PGRST116: "NOT_FOUND" when .single() fails
        const { error: insertError } = await supabase.from('user_profiles').insert({ user_id: session.user.id, weekly_generations_remaining: 50, last_generation_reset_at: new Date().toISOString() });
        if (insertError) {
            console.error("Error creating missing profile:", insertError.message);
            return { remaining: 0, error: "Could not retrieve or create generation info." };
        }
        return { remaining: 50, error: null }; // Profile created successfully
    }
    return { remaining: 0, error: "Could not retrieve generation info." };
  }
  return { remaining: data?.weekly_generations_remaining ?? 0, error: null };
}


export default async function GeneratePage() {
  const { remaining, error: generationInfoError } = await getUserGenerationInfo();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-xl border-border">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">Generate Your Image</CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Describe the image you want to create. Be as specific or abstract as you like!
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generationInfoError && (
                 <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{generationInfoError}</AlertDescription>
                </Alert>
              )}
              <div className="mb-6 p-3 bg-accent/20 rounded-md border border-accent text-sm text-accent-foreground">
                <Info className="inline-block h-5 w-5 mr-2 " />
                You have <span className="font-bold text-primary">{remaining}</span> image generations remaining this week.
              </div>
              <GenerateForm initialRemainingGenerations={remaining} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
