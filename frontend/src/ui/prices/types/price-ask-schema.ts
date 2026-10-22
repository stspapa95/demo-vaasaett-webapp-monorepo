import { z } from "zod";

export const priceAskSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Enter a question")
    .max(400, "Question must be at most 400 characters"),
});

export type TPriceAskFormValues = z.infer<typeof priceAskSchema>;
