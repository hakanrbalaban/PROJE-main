import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** App favicon / tab icon — Balaban Note mark */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "64px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2DD4BF 0%, #3B82F6 50%, #EC4899 100%)",
          borderRadius: "16px",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "40px",
            background: "white",
            borderRadius: "6px",
            display: "flex",
            flexDirection: "column",
            padding: "8px 6px",
            gap: "5px",
            position: "relative",
          }}
        >
          <div style={{ height: "3px", width: "20px", background: "#14B8A6", borderRadius: "2px" }} />
          <div style={{ height: "3px", width: "16px", background: "#14B8A6", borderRadius: "2px", opacity: 0.7 }} />
          <div style={{ height: "3px", width: "12px", background: "#14B8A6", borderRadius: "2px", opacity: 0.5 }} />
          <div
            style={{
              position: "absolute",
              right: "-6px",
              top: "10px",
              width: "14px",
              height: "14px",
              background: "#F59E0B",
              borderRadius: "3px",
              transform: "rotate(45deg)",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
