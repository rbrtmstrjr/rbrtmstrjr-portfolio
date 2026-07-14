"use client";

/**
 * Accent palette manager (/admin/settings → Accent palettes). The admin
 * curates the MENU visitors pick from in the navbar; one palette is the
 * DEFAULT (the brand face for first-time visitors and shared links).
 * Visitor picks never touch the DB — this only edits the menu.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Plus,
  Save,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  deletePalette,
  movePalette,
  savePalette,
  setDefaultPalette,
} from "@/app/actions/admin-palettes";
import {
  accentContrastWarning,
  parseAccentInput,
  sanitizeScale,
  SHADE_KEYS,
  type AccentScale,
} from "@/lib/theme-accent";
import { slugify } from "@/lib/admin/project-schema";
import type { PaletteRow } from "@/lib/palettes-data";
import { cn } from "@/lib/utils";

/** Pretty-print a scale in the paste-friendly single-quoted format. */
function formatScale(scale: AccentScale): string {
  const lines = SHADE_KEYS.map((k) => `  '${k}': '${scale[k]}'`);
  return `{\n${lines.join(",\n")}\n}`;
}

function SwatchStrip({ scale, labels = true }: { scale: AccentScale; labels?: boolean }) {
  return (
    <ul className="flex overflow-hidden rounded-lg border border-border">
      {SHADE_KEYS.map((k) => (
        <li key={k} className="min-w-0 flex-1">
          <div className="h-8" style={{ backgroundColor: scale[k] }} title={`${k} ${scale[k]}`} />
          {labels ? (
            <p className="border-t border-border bg-secondary/40 py-0.5 text-center font-mono text-[9px] text-muted-foreground">
              {k}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** Compact strip for list rows. */
function MiniStrip({ scale }: { scale: Record<string, string> }) {
  const clean = sanitizeScale(scale);
  if (!clean) return null;
  return (
    <div className="flex h-3 w-full max-w-44 overflow-hidden rounded-sm border border-border">
      {SHADE_KEYS.map((k) => (
        <span key={k} className="min-w-0 flex-1" style={{ backgroundColor: clean[k] }} />
      ))}
    </div>
  );
}

/**
 * Real components under overridden CSS vars — exactly what the public site
 * renders. The dark panel nests a `.dark` wrapper (re-applies every dark
 * token) and the inline vars win over the class, previewing unsaved input.
 */
function AccentPreview({ mode, scale }: { mode: "light" | "dark"; scale: AccentScale }) {
  const vars: Record<string, string> =
    mode === "light"
      ? { "--primary": scale["600"], "--ring": scale["600"] }
      : {
          "--primary": scale["300"],
          "--primary-foreground": scale["950"],
          "--ring": scale["300"],
        };

  return (
    <div
      style={vars as unknown as React.CSSProperties}
      className={cn(
        "rounded-xl border border-border p-4",
        mode === "dark" ? "dark bg-background text-foreground" : "bg-card"
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" type="button" tabIndex={-1} className="pointer-events-none">
          Start a project
          <ArrowRight aria-hidden />
        </Button>
        <span className="inline-flex items-center rounded-lg border border-primary/15 bg-primary/[0.05] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary/80">
          Next.js
        </span>
        <span className="text-sm font-medium text-primary">Case study →</span>
      </div>
    </div>
  );
}

/* ------------------------------ scale field ------------------------------- */

function ScaleField({
  mode,
  value,
  onChange,
}: {
  mode: "light" | "dark";
  value: string;
  onChange: (next: string) => void;
}) {
  const trimmed = value.trim();
  const parsed = React.useMemo(
    () => (trimmed ? parseAccentInput(trimmed) : null),
    [trimmed]
  );
  const warning = parsed?.ok ? accentContrastWarning(mode, parsed.scale) : null;
  const id = `palette-scale-${mode}`;

  return (
    <div className="space-y-3">
      <Label htmlFor={id}>{mode === "light" ? "Light scale" : "Dark scale"}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={7}
        spellCheck={false}
        placeholder={`{\n  '50': '#eef6ff',\n  …\n  '950': '#132458'\n}`}
        className="font-mono text-xs leading-relaxed"
      />
      {parsed && !parsed.ok ? (
        <p role="alert" className="text-xs text-destructive">
          {parsed.error}
        </p>
      ) : null}
      {warning ? <p className="text-xs text-warning">{warning}</p> : null}
      {parsed?.ok ? (
        <>
          <SwatchStrip scale={parsed.scale} />
          <AccentPreview mode={mode} scale={parsed.scale} />
        </>
      ) : null}
    </div>
  );
}

/* -------------------------------- dialog ---------------------------------- */

/**
 * Rendered INSIDE DialogContent, so it mounts fresh on every open — state
 * initializers replace the prime-on-open effect (the set-state-in-effect
 * lint rule, same pattern as the reset-password form).
 */
function PaletteForm({
  initial,
  onOpenChange,
}: {
  initial: PaletteRow | null;
  onOpenChange: (next: boolean) => void;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [name, setName] = React.useState(initial?.name ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [slugEdited, setSlugEdited] = React.useState(Boolean(initial));
  const [lightText, setLightText] = React.useState(() => {
    const light = initial ? sanitizeScale(initial.scale_light) : null;
    return light ? formatScale(light) : "";
  });
  const [darkText, setDarkText] = React.useState(() => {
    const dark = initial ? sanitizeScale(initial.scale_dark) : null;
    return dark ? formatScale(dark) : "";
  });

  const lightOk = lightText.trim() ? parseAccentInput(lightText.trim()).ok : false;
  const darkOk = darkText.trim() ? parseAccentInput(darkText.trim()).ok : false;
  const canSave = name.trim().length >= 2 && slug.trim().length > 0 && lightOk && darkOk;

  async function onSave() {
    setPending(true);
    const result = await savePalette({
      id: initial?.id,
      name: name.trim(),
      slug: slug.trim(),
      lightInput: lightText.trim(),
      darkInput: darkText.trim(),
    });
    if (result.ok) {
      toast.success(
        initial ? `Palette “${name.trim()}” updated.` : `Palette “${name.trim()}” added to the menu.`
      );
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{initial ? `Edit ${initial.name}` : "New palette"}</DialogTitle>
        <DialogDescription>
          Paste a full 11-shade scale (50 to 950) for each mode. Shade 600 drives light
          mode, shade 300 drives dark, same as the built-in blue and aquamarine.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <div>
            <Label htmlFor="palette-name">Name</Label>
            <Input
              id="palette-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugEdited) setSlug(slugify(e.target.value));
              }}
              placeholder="Ocean Blue"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="palette-slug">Slug</Label>
            <Input
              id="palette-slug"
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugEdited(true);
              }}
              placeholder="ocean-blue"
              className="mt-1.5 font-mono text-xs"
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ScaleField mode="light" value={lightText} onChange={setLightText} />
          <ScaleField mode="dark" value={darkText} onChange={setDarkText} />
        </div>

        <DialogFooter>
          <Button variant="ghost" disabled={pending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!canSave || pending} onClick={onSave}>
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />}
            {initial ? "Save changes" : "Add palette"}
          </Button>
        </DialogFooter>
    </>
  );
}

function PaletteDialog({
  initial,
  open,
  onOpenChange,
}: {
  initial: PaletteRow | null;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        {/* keyed + inside DialogContent → remounts with fresh state per open */}
        <PaletteForm
          key={initial?.id ?? "new"}
          initial={initial}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- list ----------------------------------- */

function DeletePaletteButton({ row }: { row: PaletteRow }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function onConfirm() {
    setPending(true);
    const result = await deletePalette(row.id);
    if (result.ok) {
      toast.success(`Deleted “${row.name}”.`);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Delete palette ${row.name}`}
          disabled={row.is_default}
          title={row.is_default ? "Make another palette the default first." : undefined}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 aria-hidden />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{row.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Visitors who picked it fall back to the default palette on their next visit.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost" disabled={pending}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <Button variant="destructive" disabled={pending} onClick={onConfirm}>
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Trash2 aria-hidden />}
            Delete palette
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function PalettesManager({ rows }: { rows: PaletteRow[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PaletteRow | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(row: PaletteRow) {
    setEditing(row);
    setDialogOpen(true);
  }

  async function onMakeDefault(row: PaletteRow) {
    setBusyId(row.id);
    const result = await setDefaultPalette(row.id);
    if (result.ok) {
      toast.success(`“${row.name}” is now the default accent.`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setBusyId(null);
  }

  async function onMove(row: PaletteRow, direction: "up" | "down") {
    setBusyId(row.id);
    const result = await movePalette(row.id, direction);
    if (result.ok) router.refresh();
    else toast.error(result.error);
    setBusyId(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          The accent menu visitors see in the navbar. Each visitor&apos;s pick stays in
          their own browser; the default is what first-time visitors get.
        </p>
        <Button size="sm" onClick={openNew}>
          <Plus aria-hidden />
          New palette
        </Button>
      </div>

      {rows.length ? (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {rows.map((row, i) => (
            <li
              key={row.id}
              className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{row.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{row.slug}</span>
                  {row.is_default ? (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-primary/15 bg-primary/[0.05] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-primary/80">
                      <Star className="size-2.5" aria-hidden />
                      Default
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <MiniStrip scale={row.scale_light} />
                  <MiniStrip scale={row.scale_dark} />
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                {!row.is_default ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busyId !== null}
                    onClick={() => onMakeDefault(row)}
                    className="text-muted-foreground"
                  >
                    {busyId === row.id ? (
                      <Loader2 className="animate-spin" aria-hidden />
                    ) : (
                      <Star aria-hidden />
                    )}
                    Make default
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Move ${row.name} up`}
                  disabled={busyId !== null || i === 0}
                  onClick={() => onMove(row, "up")}
                >
                  <ChevronUp aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Move ${row.name} down`}
                  disabled={busyId !== null || i === rows.length - 1}
                  onClick={() => onMove(row, "down")}
                >
                  <ChevronDown aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Edit palette ${row.name}`}
                  onClick={() => openEdit(row)}
                >
                  <Pencil aria-hidden />
                </Button>
                <DeletePaletteButton row={row} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
          No palettes yet. The site falls back to the built-in blue/aquamarine. Add the
          first palette to start the menu (it becomes the default).
        </div>
      )}

      <PaletteDialog initial={editing} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
