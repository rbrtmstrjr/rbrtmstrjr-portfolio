"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { getNotificationEmail } from "@/lib/settings-data";
import { site } from "@/lib/site";

export type ContactResult =
  | { ok: true }
  | { ok: false; error: string };

/* ----------------------------------------------------------------------------
   Basic in-memory rate limit — per serverless instance, which is enough to
   stop naive spam bursts. 5 submissions / 10 minutes / IP.
--------------------------------------------------------------------------- */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function submitInquiry(input: ContactInput): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the highlighted fields and try again." };
  }
  const data = parsed.data;

  // Honeypot filled → pretend success, tell the bot nothing.
  if (data.website && data.website.length > 0) {
    return { ok: true };
  }

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown";
  if (rateLimited(ip)) {
    return {
      ok: false,
      error: "Too many messages in a short time — please try again in a few minutes.",
    };
  }

  const supabase = getSupabaseAdmin();
  const resendKey = process.env.RESEND_API_KEY;

  // Local dev without keys: don't pretend, but don't block building either.
  if (!supabase && !resendKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[contact] No SUPABASE/RESEND env configured — logging inquiry:", {
        ...data,
        website: undefined,
      });
      return { ok: true };
    }
    console.error("[contact] Not configured in production.");
    return {
      ok: false,
      error: `Something's misconfigured on my end — please email me directly at ${site.email}.`,
    };
  }

  // 1) Store first — never lose a submission.
  let stored = false;
  if (supabase) {
    const { error } = await supabase.from("inquiries").insert({
      name: data.name,
      email: data.email,
      company: data.company || null,
      project_type: data.projectType,
      message: data.message,
    });
    if (error) {
      console.error("[contact] Supabase insert failed:", error.message);
    } else {
      stored = true;
    }
  }

  // 2) Email second.
  let emailed = false;
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      // settings-driven recipient (falls back to env, then lib/site.ts)
      const to = await getNotificationEmail();
      const from = process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";
      const { error } = await resend.emails.send({
        from,
        to,
        replyTo: data.email,
        subject: `New inquiry — ${data.projectType} — ${data.name}`,
        text: [
          `Name: ${data.name}`,
          `Email: ${data.email}`,
          `Company: ${data.company || "—"}`,
          `Project type: ${data.projectType}`,
          "",
          data.message,
        ].join("\n"),
      });
      if (error) {
        console.error("[contact] Resend failed:", error.message);
      } else {
        emailed = true;
      }
    } catch (err) {
      console.error("[contact] Resend threw:", err);
    }
  }

  if (stored || emailed) return { ok: true };
  return {
    ok: false,
    error: `Couldn't send right now — please email me directly at ${site.email}.`,
  };
}
