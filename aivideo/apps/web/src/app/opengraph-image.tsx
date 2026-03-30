import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630
};
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
          padding: "56px",
          color: "#0f172a",
          background:
            "radial-gradient(circle at 0% 0%, rgba(31,138,112,0.3), transparent 40%), linear-gradient(140deg, #fff6ea, #f6f8fb)"
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 700 }}>AI Video Lab</div>
        <div style={{ fontSize: 66, fontWeight: 900, lineHeight: 1.2 }}>
          주제 한 줄로
          <br />
          숏폼 영상 자동 제작
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}

