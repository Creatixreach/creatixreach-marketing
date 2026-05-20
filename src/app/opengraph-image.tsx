import { ImageResponse } from "next/og";

// Render on-demand instead of at build time. Works around a @vercel/og
// quirk on Windows paths containing spaces; harmless on Vercel/Linux.
export const dynamic = "force-dynamic";
export const alt = "CreatixReach - We run the whole stack";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0f172a",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "72px",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          color: "#f8fafc",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "76px",
              height: "76px",
              borderRadius: "50%",
              background: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "44px",
              fontWeight: 800,
              color: "#f8fafc",
            }}
          >
            C
          </div>
          <div
            style={{
              fontSize: "40px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            CreatixReach
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "84px",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "#f8fafc",
              maxWidth: "1000px",
            }}
          >
            We run the whole stack.
          </div>
          <div
            style={{
              fontSize: "30px",
              color: "#94a3b8",
              maxWidth: "900px",
              lineHeight: 1.3,
            }}
          >
            Digital solutions, built end-to-end.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "22px",
            color: "#94a3b8",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#4f46e5",
            }}
          />
          creatixreach.io
        </div>
      </div>
    ),
    { ...size }
  );
}
