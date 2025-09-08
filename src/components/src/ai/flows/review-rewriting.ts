'use server';

/**
 * @fileOverview A flow to rewrite a review comment using AI.
 *
 * - rewriteReview - A function that handles the review rewriting process.
 * - RewriteReviewInput - The input type for the rewriteReview function.
 * - RewriteReviewOutput - The return type for the rewriteReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RewriteReviewInputSchema = z.object({
  comment: z.string().min(10).describe('The user-written review comment to be rewritten.'),
});
export type RewriteReviewInput = z.infer<typeof RewriteReviewInputSchema>;

const RewriteReviewOutputSchema = z.object({
  rewrittenComment: z
    .string()
    .describe('A professionally-rewritten review comment based on the user\'s input.'),
});
export type RewriteReviewOutput = z.infer<typeof RewriteReviewOutputSchema>;

export async function rewriteReview(
  input: RewriteReviewInput
): Promise<RewriteReviewOutput> {
  return rewriteReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rewriteReviewPrompt',
  input: {schema: RewriteReviewInputSchema},
  output: {schema: RewriteReviewOutputSchema},
  prompt: `You are an expert copy editor specializing in user feedback. A user has provided the following draft for a project review:

"{{{comment}}}"

Your task is to rewrite this review to be more constructive, clear, and professional, while preserving the original sentiment (whether positive or negative). The final review should be concise and well-articulated. Return the result in the 'rewrittenComment' field.`,
});

const rewriteReviewFlow = ai.defineFlow(
  {
    name: 'rewriteReviewFlow',
    inputSchema: RewriteReviewInputSchema,
    outputSchema: RewriteReviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
