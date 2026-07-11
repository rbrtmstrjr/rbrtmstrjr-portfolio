"use client";

import * as React from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Reveal } from "@/components/motion/reveal";
import { WindowCard } from "@/components/ui/window-card";
import { contactSchema, PROJECT_TYPES, type ContactInput } from "@/lib/contact-schema";
import { submitInquiry } from "@/app/actions/contact";
import { EASE_OUT } from "@/lib/motion";
import { site } from "@/lib/site";

const nextSteps = [
  "I reply within 24–48 hours — personally, not a bot.",
  "We hop on a short call (or keep it async) about the problem.",
  "You get a clear proposal: scope, price, timeline.",
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs text-destructive">
      {message}
    </p>
  );
}

export function Contact() {
  const [sent, setSent] = React.useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { website: "" },
  });

  async function onSubmit(values: ContactInput) {
    const result = await submitInquiry(values);
    if (result.ok) {
      setSent(true);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <section id="contact" className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-36">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* left — warm copy + what happens next */}
          <Reveal>
            <p className="eyebrow">Contact</p>
            <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl">
              Let&apos;s solve the busywork
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
              Tell me what&apos;s slowing your business down. If software can fix
              it, I&apos;ll show you how — and if it can&apos;t, I&apos;ll tell you
              that too.
            </p>

            <div className="mt-10">
              <p className="eyebrow !text-[10px]">What happens next</p>
              <ol className="mt-4 space-y-3">
                {nextSteps.map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-sm leading-relaxed">
                    <span className="font-display text-primary">{i + 1}.</span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="mt-10 text-sm text-muted-foreground">
              Prefer email?{" "}
              <Link
                href={`mailto:${site.email}`}
                className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
              >
                {site.email}
              </Link>
            </p>
          </Reveal>

          {/* right — the form */}
          <Reveal delay={0.1}>
            <WindowCard label="contact/new-project" contentClassName="p-6 md:p-10">
              <AnimatePresence mode="wait" initial={false}>
                {sent ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE_OUT }}
                    className="flex min-h-[420px] flex-col items-center justify-center text-center"
                  >
                    <CheckCircle2 className="size-10 text-primary" aria-hidden />
                    <h3 className="mt-5 font-display text-2xl">Message sent</h3>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                      Thanks — I&apos;ve got it. Expect a personal reply within
                      24–48 hours.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="space-y-5"
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="name">
                          Name <span aria-hidden className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          autoComplete="name"
                          placeholder="Your name"
                          className="mt-1.5"
                          aria-invalid={!!errors.name}
                          {...register("name")}
                        />
                        <FieldError message={errors.name?.message} />
                      </div>
                      <div>
                        <Label htmlFor="email">
                          Email <span aria-hidden className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@company.com"
                          className="mt-1.5"
                          aria-invalid={!!errors.email}
                          {...register("email")}
                        />
                        <FieldError message={errors.email?.message} />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="company">Company (optional)</Label>
                        <Input
                          id="company"
                          autoComplete="organization"
                          placeholder="Your business"
                          className="mt-1.5"
                          {...register("company")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="projectType">
                          Project type <span aria-hidden className="text-destructive">*</span>
                        </Label>
                        <Controller
                          control={control}
                          name="projectType"
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger
                                id="projectType"
                                className="mt-1.5 w-full"
                                aria-invalid={!!errors.projectType}
                              >
                                <SelectValue placeholder="Pick the closest fit" />
                              </SelectTrigger>
                              <SelectContent>
                                {PROJECT_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <FieldError message={errors.projectType?.message} />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">
                        What&apos;s the problem?{" "}
                        <span aria-hidden className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        rows={5}
                        placeholder="e.g. We track all our orders on paper and it's costing us hours every day…"
                        className="mt-1.5 min-h-32"
                        aria-invalid={!!errors.message}
                        {...register("message")}
                      />
                      <FieldError message={errors.message?.message} />
                    </div>

                    {/* honeypot — hidden from humans, tempting to bots */}
                    <div className="absolute -left-[9999px] top-auto" aria-hidden>
                      <label htmlFor="website">Website</label>
                      <input
                        id="website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        {...register("website")}
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="btn-cta w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                          Sending…
                        </>
                      ) : (
                        <>
                          Send message
                          <Send className="size-4" aria-hidden />
                        </>
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </WindowCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
