import "server-only";
import { site } from "@/lib/site";

/**
 * GitHub contribution calendar for the homepage "Built in public" section.
 * Server-side only, baked into the static page, refreshed via ISR.
 *
 * Two paths:
 *  - GITHUB_TOKEN set → GraphQL contributionsCollection (exact per-day counts)
 *  - no token → parse the public /users/{u}/contributions HTML (levels only)
 *
 * Any failure returns null so the section simply doesn't render — never break
 * the build over GitHub.
 */

export type ContributionDay = {
  date: string; // yyyy-mm-dd
  level: 0 | 1 | 2 | 3 | 4;
  count?: number;
};

export type Contributions = {
  total: number;
  /** 7-day columns, oldest week first (GitHub layout: rows = weekdays) */
  weeks: ContributionDay[][];
};

const LEVEL_FROM_ENUM: Record<string, ContributionDay["level"]> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

export async function getContributions(): Promise<Contributions | null> {
  const { username } = site.github;
  if (!username) return null;
  try {
    return process.env.GITHUB_TOKEN
      ? await fromGraphql(username, process.env.GITHUB_TOKEN)
      : await fromPublicHtml(username);
  } catch (err) {
    console.warn("[github] contribution graph unavailable:", err);
    return null;
  }
}

async function fromGraphql(username: string, token: string): Promise<Contributions | null> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query($login: String!) {
        user(login: $login) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks { contributionDays { date contributionCount contributionLevel } }
            }
          }
        }
      }`,
      variables: { login: username },
    }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    console.warn(`[github] graphql failed (${res.status}) — falling back to public HTML`);
    return fromPublicHtml(username);
  }
  const json = await res.json();
  const calendar = json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) return fromPublicHtml(username);

  return {
    total: calendar.totalContributions ?? 0,
    weeks: (calendar.weeks ?? []).map(
      (w: { contributionDays: { date: string; contributionCount: number; contributionLevel: string }[] }) =>
        w.contributionDays.map((d) => ({
          date: d.date,
          level: LEVEL_FROM_ENUM[d.contributionLevel] ?? 0,
          count: d.contributionCount,
        }))
    ),
  };
}

/** Tokenless fallback: GitHub's own public contributions fragment. */
async function fromPublicHtml(username: string): Promise<Contributions | null> {
  const res = await fetch(`https://github.com/users/${username}/contributions`, {
    headers: { "User-Agent": "portfolio-contribution-graph" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    console.warn(`[github] contributions page failed: ${res.status}`);
    return null;
  }
  const html = await res.text();

  const totalMatch = html.match(/([\d,]+)\s+contributions?\s+in the last year/i);
  const total = totalMatch ? Number(totalMatch[1].replaceAll(",", "")) : 0;

  const days: ContributionDay[] = [...html.matchAll(
    /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g
  )]
    .map((m) => ({
      date: m[1],
      level: Math.min(4, Number(m[2])) as ContributionDay["level"],
    }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  if (!days.length) return null;

  // rebuild GitHub's week columns (Sunday-start)
  const weeks: ContributionDay[][] = [];
  let week: ContributionDay[] = [];
  for (const day of days) {
    const dow = new Date(`${day.date}T00:00:00Z`).getUTCDay();
    if (dow === 0 && week.length) {
      weeks.push(week);
      week = [];
    }
    week.push(day);
  }
  if (week.length) weeks.push(week);

  return { total, weeks };
}
