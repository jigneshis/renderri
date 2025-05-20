"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Loader2, Sparkles, Download, Edit, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { generateImageWithAI, enhanceImageWithAI } from "@/actions/aiImageActions"; 

const generateFormSchema = z.object({
  prompt: z.string().min(10, { message: "Prompt must be at least 10 characters." }).max(500, { message: "Prompt cannot exceed 500 characters."}),
});

type GenerateFormProps = {
  initialRemainingGenerations: number;
};

export default function GenerateForm({ initialRemainingGenerations }: GenerateFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [remainingGenerations, setRemainingGenerations] = useState(initialRemainingGenerations);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof generateFormSchema>>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      prompt: "",
    },
  });

  async function onSubmit(values: z.infer<typeof generateFormSchema>) {
    setIsLoading(true);
    setGeneratedImageUrl(null); 
    setEnhancedImageUrl(null);  
    setCurrentPrompt(values.prompt);

    if (remainingGenerations <= 0) {
      toast({
        title: "No Generations Left",
        description: "You have used all your free generations for this week.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await generateImageWithAI({ prompt: values.prompt });
      if (result.error) {
        toast({
          title: "Generation Failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.imageUrl && result.newRemainingGenerations !== undefined) {
        setGeneratedImageUrl(result.imageUrl);
        setRemainingGenerations(result.newRemainingGenerations);
        toast({
          title: "Image Generated!",
          description: "Your image has been successfully created.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleEnhanceImage = async () => {
    const imageToEnhance = enhancedImageUrl || generatedImageUrl;
    if (!imageToEnhance) return;
    setIsEnhancing(true);
    
    try {
      // Pass the currently displayed image (original or already enhanced) for further enhancement
      const result = await enhanceImageWithAI({ photoDataUri: imageToEnhance });
      if (result.error) {
         toast({
          title: "Enhancement Failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.enhancedPhotoDataUri) {
        setEnhancedImageUrl(result.enhancedPhotoDataUri); // This will now display the newly enhanced image
        setGeneratedImageUrl(null); // Clear original if enhanced one is shown
        toast({
          title: "Image Enhanced!",
          description: "The image quality has been improved.",
        });
      }
    } catch (error) {
       toast({
        title: "Error",
        description: "An unexpected error occurred during enhancement.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };
  
  const handleDownload = (url: string | null, filename: string) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const displayUrl = enhancedImageUrl || generatedImageUrl;

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Your Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., A futuristic cityscape at sunset, neon lights, flying cars, photorealistic"
                    className="min-h-[100px] resize-none focus:ring-primary focus:border-primary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full text-base py-6" disabled={isLoading || remainingGenerations <= 0}>
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            Generate Image
          </Button>
        </form>
      </Form>

      {isLoading && (
        <div className="text-center py-10">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Generating your masterpiece...</p>
        </div>
      )}

      {displayUrl && (
        <Card className="mt-8 overflow-hidden border-border shadow-lg">
          <CardContent className="p-0 aspect-square bg-muted/20">
            <Image
              src={displayUrl}
              alt={currentPrompt || "Generated Image"}
              width={512}
              height={512}
              className="w-full h-full object-contain"
              data-ai-hint="abstract digital art"
              unoptimized={displayUrl.startsWith('data:')} // Important for data URIs
            />
          </CardContent>
          <CardFooter className="p-4 bg-card-foreground/5 flex flex-wrap gap-2 justify-center border-t border-border">
            <Button variant="outline" onClick={() => handleDownload(displayUrl, 'renderri_image.png')}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button variant="outline" onClick={handleEnhanceImage} disabled={isEnhancing}>
              {isEnhancing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" /> }
              Enhance
            </Button>
            {/* Placeholder for Edit button */}
            {/* <Button variant="outline" disabled> 
              <Edit className="mr-2 h-4 w-4" /> Edit (Soon)
            </Button> */}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
