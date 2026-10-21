"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TIngestionRun } from "@/domain/entities/TIngestionRun";
import { formatAthensDateTime, formatEurMwh, formatRelative } from "@/ui/prices/lib/format";
import type { TPriceSummary } from "@/ui/prices/lib/summarize-prices";
import { Activity, ArrowDownRight, ArrowUpRight, Database } from "lucide-react";
import type { ReactNode } from "react";

type TPriceKpiGridProps = {
  summary: TPriceSummary | null;
  latestRun: TIngestionRun | undefined;
  isPricesLoading: boolean;
  isRunsLoading: boolean;
};

export function PriceKpiGrid({
  summary,
  latestRun,
  isPricesLoading,
  isRunsLoading,
}: TPriceKpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Latest price"
        icon={<Activity className="size-4" />}
        isLoading={isPricesLoading}
        value={summary ? formatEurMwh(summary.latest) : "—"}
        hint={
          summary
            ? `${formatAthensDateTime(summary.latestAt)} · ${summary.unit}`
            : "No points in range"
        }
      />

      <KpiCard
        label="Session low"
        icon={<ArrowDownRight className="size-4" />}
        isLoading={isPricesLoading}
        value={summary ? formatEurMwh(summary.min) : "—"}
        hint={summary ? `${summary.count} intervals` : undefined}
      />

      <KpiCard
        label="Session high"
        icon={<ArrowUpRight className="size-4" />}
        isLoading={isPricesLoading}
        value={summary ? formatEurMwh(summary.max) : "—"}
        hint={summary ? `Avg ${formatEurMwh(summary.average)}` : undefined}
      />

      <KpiCard
        label="Last ingestion"
        icon={<Database className="size-4" />}
        isLoading={isRunsLoading}
        value={latestRun ? statusLabel(latestRun.status) : "—"}
        hint={
          latestRun
            ? `${latestRun.upsertedCount} upserted · ${formatRelative(latestRun.startedAt)}`
            : "No runs yet"
        }
        badge={latestRun ? <StatusBadge status={latestRun.status} /> : null}
      />
    </div>
  );
}

function KpiCard({
  label,
  icon,
  value,
  hint,
  isLoading,
  badge,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  hint?: string;
  isLoading: boolean;
  badge?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardAction className="text-muted-foreground">{icon}</CardAction>
        {isLoading ? (
          <Skeleton className="mt-1 h-8 w-28" />
        ) : (
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold tracking-tight tabular-nums">
            {value}
            {badge}
          </CardTitle>
        )}
      </CardHeader>

      {hint && (
        <CardContent>
          <p className="text-muted-foreground text-xs">{hint}</p>
        </CardContent>
      )}
    </Card>
  );
}

function StatusBadge({ status }: { status: TIngestionRun["status"] }) {
  if (status === "succeeded") {
    return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Live</Badge>;
  }
  if (status === "failed") {
    return <Badge variant="destructive">Failed</Badge>;
  }
  return <Badge variant="secondary">Running</Badge>;
}

function statusLabel(status: TIngestionRun["status"]): string {
  if (status === "succeeded") {
    return "Succeeded";
  }
  if (status === "failed") {
    return "Failed";
  }
  return "Running";
}
