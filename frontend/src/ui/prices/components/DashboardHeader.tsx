"use client";

import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shiftIsoDate } from "@/ui/prices/lib/athens-date";

type TDashboardHeaderProps = {
  biddingZone: string;
  today: string;
  from: string;
  to: string;
  onRangeChange: (range: { from: string; to: string }) => void;
};

export function DashboardHeader({
  biddingZone,
  today,
  from,
  to,
  onRangeChange,
}: TDashboardHeaderProps) {
  return (
    <header className="bg-card/80 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
            <Zap className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-xl font-semibold tracking-tight">VaasaETT</h1>
              <Badge variant="secondary">{biddingZone}</Badge>
            </div>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Greece day-ahead prices · Europe/Athens
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={from === today && to === today ? "default" : "outline"}
              onClick={() => onRangeChange({ from: today, to: today })}
            >
              Today
            </Button>
            <Button
              type="button"
              size="sm"
              variant={from === shiftIsoDate(today, -6) && to === today ? "default" : "outline"}
              onClick={() => onRangeChange({ from: shiftIsoDate(today, -6), to: today })}
            >
              Last 7 days
            </Button>
          </div>

          <div className="flex gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="from-date" className="text-muted-foreground text-xs">
                From
              </Label>
              <Input
                id="from-date"
                type="date"
                value={from}
                max={to}
                onChange={(event) => onRangeChange({ from: event.target.value, to })}
                className="w-[10.5rem]"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="to-date" className="text-muted-foreground text-xs">
                To
              </Label>
              <Input
                id="to-date"
                type="date"
                value={to}
                min={from}
                max={today}
                onChange={(event) => onRangeChange({ from, to: event.target.value })}
                className="w-[10.5rem]"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
