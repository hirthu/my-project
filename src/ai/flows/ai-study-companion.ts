'use server';
/**
 * @fileOverview An AI study companion that answers student questions.
 *
 * - askQuestion - A function that handles the question answering process.
 * - AskQuestionInput - The input type for the askQuestion function.
 * - AskQuestionOutput - The return type for the askQuestion function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AskQuestionInputSchema = z.object({
  question: z.string().describe('The question to be answered.'),
});
export type AskQuestionInput = z.infer<typeof AskQuestionInputSchema>;

const AskQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AskQuestionOutput = z.infer<typeof AskQuestionOutputSchema>;

export async function askQuestion(input: AskQuestionInput): Promise<AskQuestionOutput> {
  return askQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askQuestionPrompt',
  input: {
    schema: z.object({
      question: z.string().describe('The question to be answered.'),
    }),
  },
  output: {
    schema: z.object({
      answer: z.string().describe('The answer to the question.'),
    }),
  },
  prompt: `You are a helpful AI study companion. Please answer the following question to the best of your ability.\n\nQuestion: {{{question}}}`, 
});

const askQuestionFlow = ai.defineFlow<
  typeof AskQuestionInputSchema,
  typeof AskQuestionOutputSchema
>({
  name: 'askQuestionFlow',
  inputSchema: AskQuestionInputSchema,
  outputSchema: AskQuestionOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
