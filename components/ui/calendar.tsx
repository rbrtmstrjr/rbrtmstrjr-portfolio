"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0", className)}
      classNames={{
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "w-full space-y-3",
        month_caption: "relative z-20 mx-9 flex h-8 items-center justify-center",
        caption_label: "text-sm font-medium",
        nav: "absolute top-0 z-10 flex w-full items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "text-muted-foreground hover:text-foreground"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "text-muted-foreground hover:text-foreground"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "size-8 p-0 font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-muted-foreground/80",
        week: "mt-1 flex w-full",
        day: "p-0",
        day_button:
          "flex size-8 items-center justify-center rounded-lg text-sm transition-colors outline-none hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring/50 group-data-selected:bg-primary group-data-selected:text-primary-foreground group-data-selected:hover:bg-primary",
        selected: "group",
        today: "[&>button]:font-semibold [&>button]:text-primary group-data-selected:[&>button]:text-primary-foreground",
        outside: "text-muted-foreground/40",
        disabled: "text-muted-foreground/30",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className="size-4" {...rest} />
          ) : (
            <ChevronRightIcon className="size-4" {...rest} />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
