// Enhance image quality using AI upscaling.

'use server';

/**
 * @fileOverview Enhances image resolution and quality using AI upscaling.
 *
 * - enhanceImageQuality - A function that enhances the resolution and quality of an image.
 * - EnhanceImageQualityInput - The input type for the enhanceImageQuality function.
 * - EnhanceImageQualityOutput - The return type for the enhanceImageQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceImageQualityInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to enhance, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EnhanceImageQualityInput = z.infer<typeof EnhanceImageQualityInputSchema>;

const EnhanceImageQualityOutputSchema = z.object({
  enhancedPhotoDataUri: z
    .string()
    .describe("The enhanced photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type EnhanceImageQualityOutput = z.infer<typeof EnhanceImageQualityOutputSchema>;

export async function enhanceImageQuality(input: EnhanceImageQualityInput): Promise<EnhanceImageQualityOutput> {
  return enhanceImageQualityFlow(input);
}

const enhanceImageQualityFlow = ai.defineFlow(
  {
    name: 'enhanceImageQualityFlow',
    inputSchema: EnhanceImageQualityInputSchema,
    outputSchema: EnhanceImageQualityOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: 'enhance the resolution and quality of this image'},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {enhancedPhotoDataUri: media.url!};
  }
);
