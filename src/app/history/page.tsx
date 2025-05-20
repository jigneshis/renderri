import Header from "@/components/layout/Header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, Edit3, AlertTriangle, Images } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

async function getHistory() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return { history: [], error: "User not authenticated." };
  }

  const { data, error } = await supabase
    .from('generations')
    .select('id, prompt_text, image_url, created_at, model_used')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching history:", error);
    return { history: [], error: "Could not retrieve generation history." };
  }
  return { history: data || [], error: null }; // Ensure data is an array
}


export default async function HistoryPage() {
  const { history, error } = await getHistory();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Your Generation History</CardTitle>
            <CardDescription className="text-muted-foreground">Review your past creations and the prompts that inspired them.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-destructive-foreground bg-destructive p-4 rounded-md mb-6 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" /> {error}
              </div>
            )}
            {!error && history.length === 0 && (
              <div className="text-center py-16">
                <Images className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
                <p className="text-xl text-muted-foreground">No images generated yet.</p>
                <Button asChild className="mt-6">
                  <Link href="/generate">Start Generating</Link>
                </Button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {history.map((item) => (
                <Card key={item.id} className="overflow-hidden flex flex-col shadow-lg hover:shadow-primary/30 transition-shadow duration-300 border-border bg-card">
                  <div className="aspect-square w-full bg-muted/30 overflow-hidden">
                    <Image
                      src={item.image_url} 
                      alt={item.prompt_text.substring(0, 50) + "..."}
                      width={300}
                      height={300}
                      className="object-cover w-full h-full"
                      data-ai-hint="digital art"
                      unoptimized={item.image_url.startsWith('data:')} // Important for data URIs
                    />
                  </div>
                  <CardContent className="p-4 flex-grow">
                    <p className="text-sm text-muted-foreground italic truncate" title={item.prompt_text}>
                      &quot;{item.prompt_text}&quot;
                    </p>
                    <p className="text-xs text-foreground/60 mt-1">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </p>
                  </CardContent>
                  <CardFooter className="p-2 border-t border-border/50 flex gap-1 justify-center bg-card-foreground/5">
                    <Button variant="ghost" size="icon" asChild title="View Full Image" className="h-8 w-8">
                       <a href={item.image_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                       </a>
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="Download Image" className="h-8 w-8">
                      <a href={item.image_url} download={`renderri_image_${item.id}.png`}>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" title="Edit Image (Soon)" className="h-8 w-8" asChild>
                       <Link href={`/edit/${item.id}`}>
                        <Edit3 className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
