"use client";

/**
 * Decorative graphics for the Services card + detail pages — token-based,
 * animated on scroll-into-view, reduced-motion safe.
 *
 * MiniDashboard  — a clean operations dashboard (custom software)
 * AutomationFlow — an n8n-style node graph with pulses flowing along the
 *                  edges (AI automation)
 *
 * size="sm" (default) is the compact homepage-card version; size="lg" is the
 * full-width, more DETAILED hero treatment on /services/[slug].
 */
import { motion } from "framer-motion";
import { Bell, Bot, FileInput, Mail, MessageSquare, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE_OUT, VIEWPORT } from "@/lib/motion";

type Size = "sm" | "lg";

/* ------------------------------ MiniDashboard ------------------------------ */

const BARS = [46, 62, 40, 74, 58, 68, 92];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function StatTile({
  label,
  value,
  accent,
  lg,
}: {
  label: string;
  value: string;
  accent?: boolean;
  lg?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card",
        lg ? "px-5 py-4" : "px-3 py-2"
      )}
    >
      <p
        className={cn(
          "truncate font-mono uppercase tracking-[0.12em] text-muted-foreground",
          lg ? "text-[10px]" : "text-[8px]"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "font-bold tracking-tight",
          lg ? "mt-1 text-2xl md:text-3xl" : "mt-0.5 text-sm",
          accent && "text-primary"
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function MiniDashboard({ size = "sm" }: { size?: Size }) {
  if (size === "sm") {
    return (
      <div
        className="flex h-44 flex-col rounded-xl border border-border bg-secondary/30 p-4"
        aria-hidden
      >
        <div className="grid grid-cols-3 gap-2.5">
          <StatTile label="Orders" value="132" />
          <StatTile label="Hrs saved" value="23" accent />
          <StatTile label="Accuracy" value="99%" />
        </div>
        <div className="mt-2.5 flex flex-1 items-end gap-1.5 rounded-lg border border-border bg-card p-2.5">
          {BARS.map((h, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.2 + i * 0.06 }}
              style={{ height: `${h}%` }}
              className={cn(
                "flex-1 origin-bottom rounded-t-sm",
                i === BARS.length - 1 ? "bg-primary" : "bg-secondary"
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ------- lg: detailed dashboard ------- */
  const activity = [
    { w: "w-3/5", pill: "Synced", accent: true },
    { w: "w-2/5", pill: "Done", accent: false },
    { w: "w-1/2", pill: "Done", accent: false },
    { w: "w-2/3", pill: "Queued", accent: false },
  ];
  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-border bg-secondary/30 p-5 md:p-6"
      aria-hidden
    >
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatTile lg label="Orders today" value="132" />
        <StatTile lg label="Hours saved / wk" value="23" accent />
        <StatTile lg label="Stock accuracy" value="99%" />
        <StatTile lg label="Low-stock alerts" value="3" />
      </div>

      <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
        {/* weekly chart with day labels + trend chip */}
        <div className="relative rounded-lg border border-border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Weekly sales
            </p>
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.8 }}
              className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-bold text-primary"
            >
              +38%
            </motion.span>
          </div>
          <div className="mt-3 flex h-32 items-end gap-2.5 md:h-40 md:gap-3">
            {BARS.map((h, i) => (
              <div key={i} className="flex h-full flex-1 flex-col justify-end gap-1.5">
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.2 + i * 0.06 }}
                  style={{ height: `${h}%` }}
                  className={cn(
                    "origin-bottom rounded-t-md",
                    i === BARS.length - 1 ? "bg-primary" : "bg-secondary"
                  )}
                />
                <span className="text-center font-mono text-[9px] text-muted-foreground/70">
                  {DAYS[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* live activity feed */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Live activity
          </p>
          <div className="mt-3 space-y-2.5">
            {activity.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.35 + i * 0.12 }}
                className="flex items-center gap-2.5 rounded-md border border-border bg-background/60 px-3 py-2.5"
              >
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    row.accent ? "bg-primary" : "bg-border"
                  )}
                />
                <span className={cn("h-1.5 rounded-full bg-secondary", row.w)} />
                <span
                  className={cn(
                    "ml-auto shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px]",
                    row.accent
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {row.pill}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ AutomationFlow ----------------------------- */

/** node card, absolutely positioned by center within a coordinate space */
function FlowNode({
  x,
  y,
  cw,
  ch,
  icon: Icon,
  label,
  sub,
  trigger,
  delay,
  lg,
}: {
  x: number;
  y: number;
  cw: number;
  ch: number;
  icon: typeof Bot;
  label: string;
  sub?: string;
  trigger?: boolean;
  delay: number;
  lg?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.5, ease: EASE_OUT, delay }}
      className={cn(
        "absolute flex -translate-x-1/2 -translate-y-1/2 items-center border",
        lg ? "gap-2.5 rounded-lg px-3.5 py-2.5 md:px-4" : "gap-1.5 rounded-md px-2.5 py-1.5",
        trigger
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-card"
      )}
      style={{ left: `${(x / cw) * 100}%`, top: `${(y / ch) * 100}%` }}
    >
      <Icon
        className={cn("shrink-0", lg ? "size-4 md:size-5" : "size-3.5", !trigger && "text-primary/70")}
        aria-hidden
      />
      <span className="flex flex-col">
        <span
          className={cn(
            "whitespace-nowrap font-mono uppercase tracking-[0.1em] text-muted-foreground",
            lg ? "text-[10px] md:text-xs" : "text-[9px]"
          )}
        >
          {label}
        </span>
        {lg && sub ? (
          <span className="whitespace-nowrap text-[9px] text-muted-foreground/60 md:text-[10px]">
            {sub}
          </span>
        ) : null}
      </span>
    </motion.div>
  );
}

type Edge = { d: string; from: [number, number]; to: [number, number] };

function Edges({ edges, strokeWidth }: { edges: Edge[]; strokeWidth: number }) {
  return (
    <>
      {edges.map(({ d }) => (
        <g key={d}>
          <path d={d} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
          <path
            d={d}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray="4 12"
            className="flow-edge"
          />
        </g>
      ))}
    </>
  );
}

/** n8n-style connection ports — round dots where edges meet the nodes
    (HTML, not SVG, so they stay perfect circles on the stretched canvas) */
function Ports({
  edges,
  cw,
  ch,
  lg,
}: {
  edges: Edge[];
  cw: number;
  ch: number;
  lg?: boolean;
}) {
  const points = edges.flatMap(({ from, to }) => [from, to]);
  return (
    <>
      {points.map(([x, y], i) => (
        <span
          key={`${x}-${y}-${i}`}
          aria-hidden
          className={cn(
            "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/60 bg-card",
            lg ? "size-2.5" : "size-2"
          )}
          style={{ left: `${(x / cw) * 100}%`, top: `${(y / ch) * 100}%` }}
        />
      ))}
    </>
  );
}

export function AutomationFlow({ size = "sm" }: { size?: Size }) {
  if (size === "sm") {
    const edges: Edge[] = [
      { d: "M 66 60 C 92 60, 100 60, 124 60", from: [66, 60], to: [124, 60] },
      { d: "M 196 52 C 224 42, 234 30, 252 28", from: [196, 52], to: [252, 28] },
      { d: "M 196 68 C 224 78, 234 90, 252 92", from: [196, 68], to: [252, 92] },
    ];
    return (
      <div
        className="relative h-44 w-full rounded-xl border border-border bg-secondary/30"
        aria-hidden
      >
        <svg viewBox="0 0 320 120" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <Edges strokeWidth={1.5} edges={edges} />
        </svg>
        <Ports edges={edges} cw={320} ch={120} />
        <FlowNode cw={320} ch={120} x={40} y={60} icon={FileInput} label="New order" trigger delay={0.15} />
        <FlowNode cw={320} ch={120} x={160} y={60} icon={Bot} label="AI agent" delay={0.3} />
        <FlowNode cw={320} ch={120} x={282} y={28} icon={Table2} label="Update sheet" delay={0.45} />
        <FlowNode cw={320} ch={120} x={282} y={92} icon={Bell} label="Notify team" delay={0.55} />
      </div>
    );
  }

  /* ------- lg: detailed n8n-style canvas ------- */
  const CW = 480;
  const CH = 200;
  const edges: Edge[] = [
    // triggers → AI agent
    { d: "M 96 62 C 130 62, 148 88, 166 94", from: [96, 62], to: [166, 94] },
    { d: "M 96 142 C 130 142, 148 114, 166 106", from: [96, 142], to: [166, 106] },
    // AI agent → outputs
    { d: "M 254 90 C 300 74, 318 48, 336 42", from: [254, 90], to: [336, 42] },
    { d: "M 254 100 C 292 100, 304 100, 330 100", from: [254, 100], to: [330, 100] },
    { d: "M 254 110 C 300 126, 318 152, 336 158", from: [254, 110], to: [336, 158] },
  ];
  return (
    <div
      className="relative h-80 w-full rounded-xl border border-border bg-secondary/30 md:h-96"
      aria-hidden
    >
      {/* n8n-style canvas dot grid */}
      <div
        className="absolute inset-0 rounded-xl opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklch, var(--foreground) 10%, transparent) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      {/* workflow name chip */}
      <span className="absolute left-4 top-4 rounded-full border border-border bg-card px-3 py-1 font-mono text-[10px] text-muted-foreground">
        workflow: order-intake
      </span>
      {/* runs chip */}
      <motion.span
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.9 }}
        className="absolute bottom-4 right-4 rounded-full bg-primary/10 px-3 py-1 font-mono text-[10px] font-bold text-primary"
      >
        214 runs today
      </motion.span>

      <svg
        viewBox={`0 0 ${CW} ${CH}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <Edges strokeWidth={1.1} edges={edges} />
      </svg>
      <Ports lg edges={edges} cw={CW} ch={CH} />

      {/* triggers */}
      <FlowNode lg cw={CW} ch={CH} x={58} y={62} icon={FileInput} label="New order" sub="POS · webhook" trigger delay={0.15} />
      <FlowNode lg cw={CW} ch={CH} x={58} y={142} icon={Mail} label="New email" sub="inbox watcher" trigger delay={0.25} />
      {/* brain */}
      <FlowNode lg cw={CW} ch={CH} x={210} y={100} icon={Bot} label="AI agent" sub="extract · decide" delay={0.4} />
      {/* outputs */}
      <FlowNode lg cw={CW} ch={CH} x={392} y={42} icon={Table2} label="Update sheet" sub="Google Sheets" delay={0.55} />
      <FlowNode lg cw={CW} ch={CH} x={392} y={100} icon={MessageSquare} label="Draft reply" sub="human approves" delay={0.65} />
      <FlowNode lg cw={CW} ch={CH} x={392} y={158} icon={Bell} label="Notify team" sub="Messenger" delay={0.75} />
    </div>
  );
}
