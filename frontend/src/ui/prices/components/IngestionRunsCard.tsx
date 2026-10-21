"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TIngestionRun } from "@/domain/entities/TIngestionRun";
import { formatAthensDateTime } from "@/ui/prices/lib/format";

type TIngestionRunsCardProps = {
  runs: TIngestionRun[];
  isLoading: boolean;
};

export function IngestionRunsCard({ runs, isLoading }: TIngestionRunsCardProps) {
  return (
    <Card className="min-w-0">
      <CardHeader className="border-b">
        <CardTitle>Ingestion runs</CardTitle>
        <CardDescription>Worker history for the price pipeline</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {isLoading ? (
          <div className="space-y-2 px-4 py-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-5/6" />
          </div>
        ) : runs.length === 0 ? (
          <p className="text-muted-foreground px-4 py-8 text-center text-sm">
            No ingestion runs yet.
          </p>
        ) : (
          <div className="max-h-[360px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead className="text-right">Fetched</TableHead>
                  <TableHead className="text-right">Upserted</TableHead>
                  <TableHead className="text-right">Skipped</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell>
                      <RunStatusBadge run={run} />
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatAthensDateTime(run.startedAt)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{run.fetchedCount}</TableCell>
                    <TableCell className="text-right tabular-nums">{run.upsertedCount}</TableCell>
                    <TableCell className="text-right">
                      <Tooltip>
                        <TooltipTrigger className="text-muted-foreground tabular-nums">
                          {run.skippedNullCount +
                            run.skippedDuplicateCount +
                            run.skippedUnrealisticCount}
                        </TooltipTrigger>
                        <TooltipContent>
                          null {run.skippedNullCount} · duplicate {run.skippedDuplicateCount} ·
                          unrealistic {run.skippedUnrealisticCount}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RunStatusBadge({ run }: { run: TIngestionRun }) {
  if (run.status === "succeeded") {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Succeeded</Badge>
    );
  }
  if (run.status === "failed") {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="destructive">Failed</Badge>
        </TooltipTrigger>
        <TooltipContent>{run.errorMessage ?? "Unknown error"}</TooltipContent>
      </Tooltip>
    );
  }
  return <Badge variant="secondary">Running</Badge>;
}
