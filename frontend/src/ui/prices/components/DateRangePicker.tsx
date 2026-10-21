"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { parseIsoDay, toIsoDay } from "@/ui/prices/lib/athens-date";
import { formatMarketDay } from "@/ui/prices/lib/format";
import { CalendarDays, ChevronDown } from "lucide-react";
import { useState } from "react";

type TDateRangePickerProps = {
  today: string;
  from: string;
  to: string;
  onRangeChange: (range: { from: string; to: string }) => void;
};

export function DateRangePicker({ today, from, to, onRangeChange }: TDateRangePickerProps) {
  return (
    <div className="flex items-end gap-3">
      <MarketDayPicker
        label="From"
        value={from}
        today={today}
        max={today}
        onChange={(nextFrom) =>
          onRangeChange({
            from: nextFrom,
            to: nextFrom > to ? nextFrom : to,
          })
        }
      />
      <MarketDayPicker
        label="To"
        value={to}
        today={today}
        min={from}
        max={today}
        onChange={(nextTo) =>
          onRangeChange({
            from: nextTo < from ? nextTo : from,
            to: nextTo,
          })
        }
      />
    </div>
  );
}

function MarketDayPicker({
  label,
  value,
  today,
  min,
  max,
  onChange,
}: {
  label: string;
  value: string;
  today: string;
  min?: string;
  max: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-1.5">
      <span className={cn("text-muted-foreground text-xs")}>{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-9 gap-2 px-3 font-normal"
            aria-label={label}
          >
            <CalendarDays className={cn("text-muted-foreground size-4")} />
            <span className="tabular-nums">{formatMarketDay(value)}</span>
            <ChevronDown className={cn("text-muted-foreground size-3.5")} />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto p-3">
          <Calendar
            mode="single"
            selected={parseIsoDay(value)}
            today={parseIsoDay(today)}
            disabled={[...(min ? [{ before: parseIsoDay(min) }] : []), { after: parseIsoDay(max) }]}
            onSelect={(date) => {
              if (!date) {
                return;
              }

              onChange(toIsoDay(date));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
