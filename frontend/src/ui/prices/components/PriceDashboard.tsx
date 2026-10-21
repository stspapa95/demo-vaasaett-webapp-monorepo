"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { DailyStatsCard } from "@/ui/prices/components/DailyStatsCard";
import { DashboardHeader } from "@/ui/prices/components/DashboardHeader";
import { IngestionRunsCard } from "@/ui/prices/components/IngestionRunsCard";
import { LatestIntervalsCard } from "@/ui/prices/components/LatestIntervalsCard";
import { PriceChartCard } from "@/ui/prices/components/PriceChartCard";
import { PriceKpiGrid } from "@/ui/prices/components/PriceKpiGrid";
import { useDailyStats } from "@/ui/prices/hooks/use-daily-stats";
import { useIngestionRuns } from "@/ui/prices/hooks/use-ingestion-runs";
import { usePrices } from "@/ui/prices/hooks/use-prices";
import { summarizePrices } from "@/ui/prices/lib/summarize-prices";
import { validatePriceRange } from "@/ui/prices/lib/validate-price-range";
import { CircleAlert } from "lucide-react";
import { useMemo, useState } from "react";

const BIDDING_ZONE = "GR";

type TDateRange = {
  from: string;
  to: string;
};

export function PriceDashboard({ today }: { today: string }) {
  const [range, setRange] = useState<TDateRange>({ from: today, to: today });
  const { from, to } = range;
  const query = { biddingZone: BIDDING_ZONE, from, to };
  const rangeError = validatePriceRange(from, to);

  const prices = usePrices(query);
  const dailyStats = useDailyStats(query);
  const ingestionRuns = useIngestionRuns();

  const summary = useMemo(() => summarizePrices(prices.data ?? []), [prices.data]);

  const errorMessage =
    rangeError ??
    queryErrorMessage(prices.error) ??
    queryErrorMessage(dailyStats.error) ??
    queryErrorMessage(ingestionRuns.error);

  return (
    <div className="min-h-full bg-[radial-gradient(ellipse_at_top,_oklch(0.97_0.02_185),_transparent_55%)]">
      <DashboardHeader
        biddingZone={BIDDING_ZONE}
        today={today}
        from={from}
        to={to}
        onRangeChange={setRange}
      />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
        {errorMessage && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>Could not load the dashboard</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <PriceKpiGrid
          summary={summary}
          latestRun={ingestionRuns.data?.[0]}
          isPricesLoading={prices.isPending}
          isRunsLoading={ingestionRuns.isPending}
        />

        <PriceChartCard
          points={prices.data ?? []}
          from={from}
          to={to}
          isLoading={prices.isPending}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <DailyStatsCard stats={dailyStats.data ?? []} isLoading={dailyStats.isPending} />
          <IngestionRunsCard runs={ingestionRuns.data ?? []} isLoading={ingestionRuns.isPending} />
        </div>

        <LatestIntervalsCard points={prices.data ?? []} isLoading={prices.isPending} />
      </main>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-full bg-[radial-gradient(ellipse_at_top,_oklch(0.97_0.02_185),_transparent_55%)]">
      <div className="bg-card/80 border-b">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-5">
          <Skeleton className="size-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-[380px] rounded-xl" />
      </div>
    </div>
  );
}

function queryErrorMessage(error: unknown): string | null {
  if (!error) {
    return null;
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}
