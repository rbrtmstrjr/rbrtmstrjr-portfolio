"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {/* reducedMotion="user" gives every Framer Motion animation a graceful
          prefers-reduced-motion fallback for free */}
      <MotionConfig reducedMotion="user">
        {children}
        <Toaster position="bottom-right" />
      </MotionConfig>
    </ThemeProvider>
  );
}
