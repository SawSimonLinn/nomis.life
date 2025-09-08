'use server';

/**
 * @fileOverview A flow to suggest project tags based on a list of project titles using AI.
 *
 * - suggestProjectTech - A function that handles the tag suggestion process.
 * - SuggestProjectTechInput - The input type for the suggestProjectTech function.
 * - SuggestProjectTechOutput - The return type for the suggestProjectTech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestProjectTechInputSchema = z.object({
  projectTitles: z
    .array(z.string())
    .describe('A list of project titles to analyze for common keywords.'),
});
export type SuggestProjectTechInput = z.infer<typeof SuggestProjectTechInputSchema>;

const SuggestProjectTechOutputSchema = z.object({
  tech: z
    .array(z.string())
    .length(6)
    .describe('An array of 6 suggested one-word tags based on the most common themes in the project titles.'),
});
export type SuggestProjectTechOutput = z.infer<typeof SuggestProjectTechOutputSchema>;

export async function suggestProjectTech(input: SuggestProjectTechInput): Promise<SuggestProjectTechOutput> {
  return suggestProjectTechFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestProjectTechPrompt',
  input: {schema: SuggestProjectTechInputSchema},
  output: {schema: SuggestProjectTechOutputSchema},
  prompt: `You are an AI assistant that analyzes a list of software project titles and identifies the most common and relevant keywords or themes.
Based on the following project titles, generate a list of 6 single-word tags that would be good for categorizing them.
Focus on extracting the most frequent and meaningful terms. For example, if you see many projects with "AI" or "SaaS", those would be good tags.

Project Titles:
{{#each projectTitles}}
- {{{this}}}
{{/each}}
`,
});

const suggestProjectTechFlow = ai.defineFlow(
  {
    name: 'suggestProjectTechFlow',
    inputSchema: SuggestProjectTechInputSchema,
    outputSchema: SuggestProjectTechOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
