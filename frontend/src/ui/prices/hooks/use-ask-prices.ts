"use client";

import { useMutation } from "@tanstack/react-query";
import { rl } from "@/core/resourceLocator";
import { UAskPrices } from "@/domain/useCases/UAskPrices";

export function useAskPrices() {
  return useMutation({
    mutationFn: (question: string) =>
      rl.get<UAskPrices>(UAskPrices.symbol).execute(question),
  });
}
