"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { TPricePoint } from "@/domain/entities/TPricePoint";
import { formatAthensDateTime, formatAthensTime, formatEurMwh } from "@/ui/prices/lib/format";

const PRICE_COLOR = "#0d9488";

const chartConfig = {
  price: {
    label: "EUR / MWh",
    color: PRICE_COLOR,
  },
} satisfies ChartConfig;

type TPriceChartCardProps = {
  points: TPricePoint[];
  from: string;
  to: string;
  isLoading: boolean;
};

export function PriceChartCard({ points, from, to, isLoading }: TPriceChartCardProps) {
  const data = points.map((point) => ({
    occurredAt: point.occurredAt,
    price: point.price,
    tick: from === to ? formatAthensTime(point.occurredAt) : formatAthensDateTime(point.occurredAt),
  }));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <CardTitle>15-minute day-ahead</CardTitle>
        <CardDescription>
          {from === to ? `Market day ${from}` : `${from} → ${to}`} · bidding zone GR
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <Skeleton className="h-[320px] w-full rounded-xl" />
        ) : data.length === 0 ? (
          <div className="text-muted-foreground flex h-[320px] items-center justify-center rounded-xl border border-dashed text-sm">
            No prices in this range.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[320px] w-full">
            <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PRICE_COLOR} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={PRICE_COLOR} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="tick" tickLine={false} axisLine={false} minTickGap={28} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={(value: number) => formatEurMwh(value)}
                domain={[
                  (min: number) => Math.floor(min * 0.96),
                  (max: number) => Math.ceil(max * 1.04),
                ]}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value) =>
                      typeof value === "number" ? formatEurMwh(value) : String(value ?? "")
                    }
                  />
                }
              />
              <Area
                dataKey="price"
                type="monotone"
                fill="url(#fillPrice)"
                stroke={PRICE_COLOR}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
