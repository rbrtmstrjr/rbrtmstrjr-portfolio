"use client";

/**
 * shadcn-style date field: Popover + Calendar, speaking yyyy-mm-dd strings so
 * it drops into react-hook-form Controllers where <input type="date"> was.
 */
import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function toDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00`); // local midnight — no TZ drift
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function toValue(date?: Date): string {
  if (!date) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  className,
}: {
  id?: string;
  /** yyyy-mm-dd or "" */
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const date = toDate(value);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "h-10 flex-1 justify-start px-3 text-sm font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="size-4 text-muted-foreground" aria-hidden />
            {date
              ? date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-3">
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            onSelect={(next) => {
              onChange(toValue(next ?? undefined));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {date ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clear date"
          className="text-muted-foreground"
          onClick={() => onChange("")}
        >
          <X aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}
