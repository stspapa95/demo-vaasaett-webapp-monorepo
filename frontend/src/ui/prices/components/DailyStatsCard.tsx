"use client";

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
import type { TDailyStats } from "@/domain/entities/TDailyStats";
import { formatEurMwh, formatMarketDay } from "@/ui/prices/lib/format";

type TDailyStatsCardProps = {
  stats: TDailyStats[];
  isLoading: boolean;
};

export function DailyStatsCard({ stats, isLoading }: TDailyStatsCardProps) {
  return (
    <Card className="min-w-0">
      <CardHeader className="border-b">
        <CardTitle>Daily stats</CardTitle>
        <CardDescription>Min, max and average by market day</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {isLoading ? (
          <div className="space-y-2 px-4 py-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-5/6" />
          </div>
        ) : stats.length === 0 ? (
          <p className="text-muted-foreground px-4 py-8 text-center text-sm">
            No daily stats in this range.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead className="text-right">Min</TableHead>
                <TableHead className="text-right">Max</TableHead>
                <TableHead className="text-right">Average</TableHead>
                <TableHead className="text-right">Samples</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((row) => (
                <TableRow key={row.day}>
                  <TableCell className="font-medium">{formatMarketDay(row.day)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatEurMwh(row.min)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatEurMwh(row.max)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatEurMwh(row.average)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right tabular-nums">
                    {row.count}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
