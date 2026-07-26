import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS home-screen icon — Safari does not use SVG favicons. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#09090b",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 26,
            top: 62,
            width: 26,
            height: 56,
            background: "#34d399",
            borderRadius: 8,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 52,
            top: 78,
            width: 76,
            height: 24,
            background: "#34d399",
            borderRadius: 6,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 128,
            top: 50,
            width: 26,
            height: 80,
            background: "#34d399",
            borderRadius: 8,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
