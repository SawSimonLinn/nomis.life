
'use server';

/**
 * @fileOverview A flow to generate a "What I bring to the table" statement from keywords.
 *
 * - generateContribution - A function that handles the contribution generation process.
 * - GenerateContributionInput - The input type for the generateContribution function.
 * - GenerateContributionOutput - The return type for the generateContribution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContributionInputSchema = z.object({
  keywords: z
    .string()
    .min(3)
    .describe(
      'A comma-separated list of keywords or a short phrase describing the user\'s strengths and value proposition.'
    ),
});
export type GenerateContributionInput = z.infer<typeof GenerateContributionInputSchema>;

const GenerateContributionOutputSchema = z.object({
  contribution: z
    .string()
    .describe('A professionally-written contribution statement based on the provided keywords.'),
});
export type GenerateContributionOutput = z.infer<typeof GenerateContributionOutputSchema>;

export async function generateContribution(
  input: GenerateContributionInput
): Promise<GenerateContributionOutput> {
  return generateContributionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContributionPrompt',
  input: {schema: GenerateContributionInputSchema},
  output: {schema: GenerateContributionOutputSchema},
  prompt: `You are an expert career coach. A user has provided the following keywords to describe what they bring to a team: {{{keywords}}}.

Based on these keywords, write a compelling and professional "What I bring to the table" statement. The statement should be 1-3 sentences long and highlight their unique value. Frame it from the user's perspective (e.g., "I excel at...").`,
});

const generateContributionFlow = ai.defineFlow(
  {
    name: 'generateContributionFlow',
    inputSchema: GenerateContributionInputSchema,
    outputSchema: GenerateContributionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
