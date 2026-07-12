/**
 * Site-wide config — one place to edit identity, links, and copy anchors.
 */
export const site = {
  name: "Robert Maestro",
  /** Short wordmark used in the navbar */
  wordmark: "RM.",
  role: "Custom Software & AI Automation",
  email: "robertmaestro09@gmail.com",
  url: "https://robertmaestro.dev", // TODO: replace with the real domain before deploy
  description:
    "I help businesses grow by building custom software and AI automation that eliminates manual work and turns operations digital.",
  credibility: "400+ websites & apps shipped",
  socials: {
    github: "https://github.com/rbrtmstrjr",
    linkedin: "https://www.linkedin.com/", // TODO: real profile
  },
  /** Live GitHub commit feed (homepage "still shipping" section) */
  github: {
    username: "rbrtmstrjr",
    /** commits shown in the feed */
    commitCount: 6,
    /** repos to hide from the public feed (owner/name, exact match) */
    ignoreRepos: [] as string[],
  },
  nav: [
    { label: "Services", href: "/#services" },
    { label: "Work", href: "/#work" },
    { label: "Journey", href: "/#journey" },
    { label: "Process", href: "/#process" },
  ],
} as const;
