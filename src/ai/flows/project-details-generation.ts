'use server';

/**
 * @fileOverview A flow to generate project details (features, challenges, learnings) from a project's description.
 *
 * - generateProjectDetails - A function that handles the project detail generation process.
 * - GenerateProjectDetailsInput - The input type for the generateProjectDetails function.
 * - GenerateProjectDetailsOutput - The return type for the generateProjectDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectDetailsInputSchema = z.object({
  description: z.string().min(10).describe('The description of the project.'),
  careerPath: z.string().optional().describe("The user's selected career path (e.g., 'Software Engineering')."),
});
export type GenerateProjectDetailsInput = z.infer<typeof GenerateProjectDetailsInputSchema>;

const GenerateProjectDetailsOutputSchema = z.object({
  features: z
    .array(z.string())
    .describe('An array of key features for the project.'),
  challenges: z
    .string()
    .describe('A paragraph describing the challenges faced during the project.'),
  learnings: z
    .string()
    .describe('A paragraph describing what was learned during the project.'),
});
export type GenerateProjectDetailsOutput = z.infer<typeof GenerateProjectDetailsOutputSchema>;

export async function generateProjectDetails(
  input: GenerateProjectDetailsInput
): Promise<GenerateProjectDetailsOutput> {
  return generateProjectDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProjectDetailsPrompt',
  input: {schema: GenerateProjectDetailsInputSchema},
  output: {schema: GenerateProjectDetailsOutputSchema},
  prompt: `You are an expert project manager and software developer. A user is creating a portfolio piece.
Based on the following project description, please generate a list of likely features, a summary of potential challenges, and a summary of the key learnings.

{{#if careerPath}}
IMPORTANT: Tailor your response to someone with a career path in "{{careerPath}}". Frame the challenges and learnings from their perspective.
For example, for a UI/UX designer, focus on design challenges. For a Data Scientist, focus on data-related challenges.
{{/if}}

Project Description:
{{{description}}}

Based on this, generate the following:
- A list of 3-5 key features.
- A 1-2 sentence paragraph about the primary challenges that were likely overcome.
- A 1-2 sentence paragraph about the main things someone would learn from building this project.
`,
});

const generateProjectDetailsFlow = ai.defineFlow(
  {
    name: 'generateProjectDetailsFlow',
    inputSchema: GenerateProjectDetailsInputSchema,
    outputSchema: GenerateProjectDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
