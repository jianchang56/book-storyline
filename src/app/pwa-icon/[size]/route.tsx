import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }];
}

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const requestedSize = Number((await params).size);
  if (![192, 512].includes(requestedSize)) {
    return new Response("Not found", { status: 404 });
  }
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "22%",
        background: "#275b5b",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "66%",
          height: "58%",
        }}
      >
        <div
          style={{
            width: "50%",
            height: "100%",
            borderRadius: "14% 3% 3% 14%",
            background: "#f8fbfa",
          }}
        />
        <div
          style={{
            width: "50%",
            height: "100%",
            borderRadius: "3% 14% 14% 3%",
            background: "#e3eceb",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "8%",
            bottom: "8%",
            left: "49%",
            width: "2%",
            borderRadius: 999,
            background: "#9fb9b5",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "25%",
            right: "15%",
            width: "11%",
            height: "11%",
            borderRadius: 999,
            background: "#cc684b",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "19.5%",
            top: "34%",
            width: "2%",
            height: "31%",
            background: "#cc684b",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "15%",
            bottom: "24%",
            width: "11%",
            height: "11%",
            borderRadius: 999,
            background: "#cc684b",
          }}
        />
      </div>
    </div>,
    { width: requestedSize, height: requestedSize },
  );
}
