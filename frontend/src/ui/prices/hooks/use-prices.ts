"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { rl } from "@/core/resourceLocator";
import type { TPriceRangeQuery } from "@/domain/entities/TPriceRangeQuery";
import { UGetPrices } from "@/domain/useCases/UGetPrices";
import { validatePriceRange } from "@/ui/prices/lib/validate-price-range";

export function usePrices(query: TPriceRangeQuery) {
  return useQuery({
    queryKey: ["prices", query.biddingZone, query.from, query.to],
    queryFn: () => rl.get<UGetPrices>(UGetPrices.symbol).execute(query),
    enabled: validatePriceRange(query.from, query.to) === null,
    placeholderData: keepPreviousData,
  });
}
