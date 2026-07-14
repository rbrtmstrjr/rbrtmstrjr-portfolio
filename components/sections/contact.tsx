"use client";

import * as React from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Mail, Send } from "lucide-react";
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

/* Brand icons — removed from lucide 1.x, kept as minimal inline SVGs */
function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.16 1.18a11 11 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs text-destructive">
      {message}
    </p>
  );
}

export function Contact({
  contactEmail = site.email,
  githubUrl = site.socials.github,
  linkedinUrl = site.socials.linkedin,
}: {
  contactEmail?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}) {
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
              it, I&apos;ll show you how. If it can&apos;t, I&apos;ll tell you that
              too.
            </p>

            {/* direct contact + socials — moved here from the old site footer */}
            <div className="mt-10 border-t border-border pt-8">
              <p className="eyebrow !text-[10px]">Reach me directly</p>
              <ul className="mt-4 space-y-1">
                <li>
                  <Link
                    href={`mailto:${contactEmail}`}
                    className="inline-flex items-center gap-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <Mail className="size-4 text-primary" aria-hidden />
                    {contactEmail}
                  </Link>
                </li>
                <li>
                  <Link
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <GithubIcon className="size-4 text-primary" />
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <LinkedinIcon className="size-4 text-primary" />
                    LinkedIn
                  </Link>
                </li>
              </ul>
            </div>
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
                      Thanks, I&apos;ve got it. Expect a personal reply within a
                      day or two.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="space-y-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="name">Name</Label>
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
                        <Label htmlFor="email">Email</Label>
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

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="company">
                          Company{" "}
                          <span className="font-normal text-muted-foreground">· optional</span>
                        </Label>
                        <Input
                          id="company"
                          autoComplete="organization"
                          placeholder="Your business"
                          className="mt-1.5"
                          {...register("company")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="projectType">Project type</Label>
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
                      <Label htmlFor="message">What&apos;s the problem?</Label>
                      <Textarea
                        id="message"
                        rows={4}
                        placeholder="e.g. We track all our orders on paper and it's costing us hours every day…"
                        className="mt-1.5 min-h-28"
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
