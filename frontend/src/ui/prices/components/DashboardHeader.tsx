"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "@/ui/prices/components/DateRangePicker";
import { shiftIsoDate } from "@/ui/prices/lib/athens-date";
import { Zap } from "lucide-react";

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
  const last7From = shiftIsoDate(today, -6);
  const isToday = from === today && to === today;
  const isLast7 = from === last7From && to === today;

  return (
    <header className={cn("bg-card/80 border-b backdrop-blur-md")}>
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
            <p className={cn("text-muted-foreground mt-0.5 text-sm")}>
              Greece day-ahead prices · Europe/Athens
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ButtonGroup>
            <Button
              type="button"
              size="sm"
              variant={isToday ? "default" : "outline"}
              onClick={() => onRangeChange({ from: today, to: today })}
            >
              Today
            </Button>
            <Button
              type="button"
              size="sm"
              variant={isLast7 ? "default" : "outline"}
              onClick={() => onRangeChange({ from: last7From, to: today })}
            >
              Last 7 days
            </Button>
          </ButtonGroup>

          <DateRangePicker today={today} from={from} to={to} onRangeChange={onRangeChange} />
        </div>
      </div>
    </header>
  );
}
