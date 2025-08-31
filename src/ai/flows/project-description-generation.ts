'use server';

/**
 * @fileOverview A flow to rewrite a project description using AI.
 *
 * - rewriteProjectDescription - A function that handles the description rewriting process.
 * - RewriteProjectDescriptionInput - The input type for the rewriteProjectDescription function.
 * - RewriteProjectDescriptionOutput - The return type for the rewriteProjectDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RewriteProjectDescriptionInputSchema = z.object({
  description: z.string().min(10).describe('The user-written project description to be rewritten.'),
});
export type RewriteProjectDescriptionInput = z.infer<typeof RewriteProjectDescriptionInputSchema>;

const RewriteProjectDescriptionOutputSchema = z.object({
  rewrittenDescription: z
    .string()
    .describe('A professionally-rewritten project description based on the user\'s input.'),
});
export type RewriteProjectDescriptionOutput = z.infer<typeof RewriteProjectDescriptionOutputSchema>;

export async function rewriteProjectDescription(
  input: RewriteProjectDescriptionInput
): Promise<RewriteProjectDescriptionOutput> {
  return rewriteProjectDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rewriteProjectDescriptionPrompt',
  input: {schema: RewriteProjectDescriptionInputSchema},
  output: {schema: RewriteProjectDescriptionOutputSchema, toJSON: true, zod: RewriteProjectDescriptionOutputSchema},
  prompt: `You are an expert copywriter specializing in software projects. A user has provided the following draft for a project description:

"{{{description}}}"

Your task is to rewrite this description to be more compelling, professional, and concise. The final description should be 2-4 sentences long and highlight the project's main purpose and key value propositions. Return the result in the 'rewrittenDescription' field.`,
});

const rewriteProjectDescriptionFlow = ai.defineFlow(
  {
    name: 'rewriteProjectDescriptionFlow',
    inputSchema: RewriteProjectDescriptionInputSchema,
    outputSchema: RewriteProjectDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
