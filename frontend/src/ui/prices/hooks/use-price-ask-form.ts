"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAskPrices } from "@/ui/prices/hooks/use-ask-prices";
import {
  priceAskSchema,
  type TPriceAskFormValues,
} from "@/ui/prices/types/price-ask-schema";

export function usePriceAskForm() {
  const askPrices = useAskPrices();

  const form = useForm<TPriceAskFormValues>({
    resolver: zodResolver(priceAskSchema),
    defaultValues: { question: "" },
  });

  return {
    form,
    onSubmit: form.handleSubmit((values) => {
      form.clearErrors("root");
      askPrices.mutate(values.question, {
        onError: (err) => {
          form.setError("root", {
            message: err instanceof Error ? err.message : "Something went wrong",
          });
        },
      });
    }),
    askPreset: (question: string) => {
      form.clearErrors("root");
      form.setValue("question", question, { shouldValidate: true });
      askPrices.mutate(question, {
        onError: (err) => {
          form.setError("root", {
            message: err instanceof Error ? err.message : "Something went wrong",
          });
        },
      });
    },
    isLoading: askPrices.isPending,
    answer: askPrices.data?.answer ?? null,
    error: form.formState.errors.root?.message ?? null,
  };
}
