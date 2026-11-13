"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#04070e",
          color: "#e7edf9",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420, padding: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: "0 auto 20px",
              borderRadius: 16,
              background: "linear-gradient(135deg,#17e8a0,#22d3ee)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              color: "#04120c",
              fontSize: 22,
            }}
          >
            A
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 10px" }}>
            A hiccup, not a breach.
          </h1>
          <p style={{ fontSize: 14, color: "#8ea0c0", lineHeight: 1.6, margin: "0 0 24px" }}>
            The page hit an unexpected error. Your account and assets were never touched.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#17e8a0",
              color: "#04120c",
              border: 0,
              borderRadius: 12,
              padding: "10px 22px",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
