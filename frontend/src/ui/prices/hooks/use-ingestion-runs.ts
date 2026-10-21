"use client";

import { rl } from "@/core/resourceLocator";
import { UGetIngestionRuns } from "@/domain/useCases/UGetIngestionRuns";
import { useQuery } from "@tanstack/react-query";

export function useIngestionRuns(limit = 20) {
  return useQuery({
    queryKey: ["ingestion-runs", limit],
    queryFn: () => rl.get<UGetIngestionRuns>(UGetIngestionRuns.symbol).execute(limit),
  });
}
