'use server';

/**
 * @fileOverview A flow to suggest project techStack based on the project's GitHub repository content using AI.
 *
 * - suggestProjectTech - A function that handles the techStack suggestion process.
 * - SuggestProjectTechInput - The input type for the suggestProjectTech function.
 * - SuggestProjectTechOutput - The return type for the suggestProjectTech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestProjectTechInputSchema = z.object({
  githubRepoUrl: z
    .string()
    .url()
    .describe('The URL of the GitHub repository to analyze.'),
});
export type SuggestProjectTechInput = z.infer<typeof SuggestProjectTechInputSchema>;

const SuggestProjectTechOutputSchema = z.object({
  techStack: z
    .array(z.string())
    .describe('An array of suggested techStack for the project.'),
});
export type SuggestProjectTechOutput = z.infer<typeof SuggestProjectTechOutputSchema>;

export async function suggestProjectTech(input: SuggestProjectTechInput): Promise<SuggestProjectTechOutput> {
  return suggestProjectTechFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestProjectTechPrompt',
  input: {schema: SuggestProjectTechInputSchema},
  output: {schema: SuggestProjectTechOutputSchema},
  prompt: `You are an AI assistant that suggests relevant technologies for a software project based on its GitHub repository URL.\n  Analyze the content of the repository and identify the technologies, frameworks, libraries, and languages used in the project.\n  Return a list of techStack that accurately categorize the project.\n  \n  GitHub Repository URL: {{{githubRepoUrl}}}\n  \n  Suggested Tech:`,
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
