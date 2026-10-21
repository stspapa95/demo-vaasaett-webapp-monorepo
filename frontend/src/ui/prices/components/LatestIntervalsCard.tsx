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
import type { TPricePoint } from "@/domain/entities/TPricePoint";
import { formatAthensDateTime, formatEurMwh } from "@/ui/prices/lib/format";

type TLatestIntervalsCardProps = {
  points: TPricePoint[];
  isLoading: boolean;
};

export function LatestIntervalsCard({ points, isLoading }: TLatestIntervalsCardProps) {
  const latest = [...points].slice(-12).reverse();

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Latest intervals</CardTitle>
        <CardDescription>Most recent 15-minute settlement periods</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {isLoading ? (
          <div className="space-y-2 px-4 py-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-5/6" />
          </div>
        ) : latest.length === 0 ? (
          <p className="text-muted-foreground px-4 py-8 text-center text-sm">
            No interval prices to show.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Occurred at</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Unit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latest.map((point) => (
                <TableRow key={point.occurredAt}>
                  <TableCell className="font-medium tabular-nums">
                    {formatAthensDateTime(point.occurredAt)}
                  </TableCell>
                  <TableCell>{point.biddingZone}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatEurMwh(point.price)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{point.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
