import Header from "@/components/layout/Header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Construction } from "lucide-react";
import Link from "next/link";

async function getImageData(id: string) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    // This will be caught by middleware, but as a fallback:
    return { image: null, error: "User not authenticated. Please log in." };
  }

  const { data, error } = await supabase
    .from('generations')
    .select('id, prompt_text, image_url, user_id')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error("Error fetching image for editing:", error);
    // Return an error message that can be displayed, or trigger notFound
    if (error?.code === 'PGRST116') return { image: null, error: "Image not found." }; // PGRST116: Row not found
    return { image: null, error: "Error fetching image details." };
  }

  if (data.user_id !== session.user.id) {
     return { image: null, error: "You do not have permission to edit this image." };
  }

  return { image: data, error: null };
}


export default async function EditImagePage({ params }: { params: { id: string } }) {
  const { image, error } = await getImageData(params.id);

  if (!image && error) {
    // If image is null and there's an error, decide how to handle
    // For "not found" or "permission denied", trigger a 404 or specific error display
    if (error.includes("not found") || error.includes("permission") || error.includes("authenticated")) {
        // Optionally, you could redirect to login if "authenticated" error
        // For this structure, a general notFound might be too abrupt. Let's display the error.
        // notFound();
    }
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto border-border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Edit Image</CardTitle>
            <CardDescription className="text-muted-foreground">
              {image ? `Editing image from prompt: "${image.prompt_text.substring(0,70)}..."` : "Image Editor"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && !image && ( // Only show this if image loading failed critically
               <div className="text-destructive-foreground bg-destructive p-4 rounded-md my-6 flex flex-col items-center text-center">
                <AlertTriangle className="h-8 w-8 mb-2" /> 
                <p className="font-semibold text-lg mb-1">Could not load image</p>
                <p>{error}</p>
                <Button asChild variant="secondary" className="mt-4">
                    <Link href="/history">Back to History</Link>
                </Button>
              </div>
            )}
            {image && (
              <div className="space-y-6">
                <div className="aspect-square w-full bg-muted/30 overflow-hidden rounded-md border border-border">
                  <Image
                    src={image.image_url}
                    alt={image.prompt_text}
                    width={512}
                    height={512}
                    className="object-contain w-full h-full"
                    data-ai-hint="artwork abstract"
                    unoptimized={image.image_url.startsWith('data:')} // Important for data URIs
                  />
                </div>
                
                <div className="text-center p-8 border-2 border-dashed border-border rounded-md bg-card">
                    <Construction className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold text-muted-foreground">Image Editing Coming Soon!</h3>
                    <p className="text-muted-foreground/80 mt-2">
                        Basic client-side tools like cropping and resizing will be available here.
                    </p>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" asChild>
                        <Link href="/history">Back to History</Link>
                    </Button>
                    <Button disabled>Save Changes (Soon)</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
