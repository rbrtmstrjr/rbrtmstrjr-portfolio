import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#f2f6fb",
          color: "#131b2e",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#4a5878",
            fontFamily: "monospace",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 9999,
              backgroundColor: "#0c4eff",
            }}
          />
          {site.role}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#4a5878",
              fontFamily: "sans-serif",
              maxWidth: 900,
              lineHeight: 1.35,
            }}
          >
            {site.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#4a5878",
            fontFamily: "sans-serif",
            borderTop: "1px solid #dde5f0",
            paddingTop: 28,
          }}
        >
          <div>{site.credibility}</div>
          <div style={{ color: "#0c4eff" }}>Start a project →</div>
        </div>
      </div>
    ),
    size
  );
}
