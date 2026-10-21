"use client";

import { rl } from "@/core/resourceLocator";
import type { TPriceRangeQuery } from "@/domain/entities/TPriceRangeQuery";
import { UGetDailyStats } from "@/domain/useCases/UGetDailyStats";
import { validatePriceRange } from "@/ui/prices/lib/validate-price-range";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useDailyStats(query: TPriceRangeQuery) {
  return useQuery({
    queryKey: ["prices", "daily-stats", query.biddingZone, query.from, query.to],
    queryFn: () => rl.get<UGetDailyStats>(UGetDailyStats.symbol).execute(query),
    enabled: validatePriceRange(query.from, query.to) === null,
    placeholderData: keepPreviousData,
  });
}
