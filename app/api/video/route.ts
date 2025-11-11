import { NextRequest, NextResponse } from "next/server";

import https from "https";

import http from "http";

export async function GET(req: NextRequest) {
  const range = req.headers.get("range");

  const videoUrl = req.url.split("id=")[1];

  console.log(videoUrl);
  if (!range) {
    return new NextResponse("Requires Range header", { status: 400 });
  }

  const client = videoUrl.startsWith("https") ? https : http;

  // const options = { headers: { Range: range } }

  return new Promise((resolve, reject) => {
    client

      .get(videoUrl, (videoStream) => {
        console.log("bibash", videoStream.statusCode);

        if (
          !videoStream.statusCode ||
          (videoStream.statusCode !== 206 && videoStream.statusCode !== 200)
        ) {
          resolve(
            new NextResponse(null, { status: videoStream.statusCode || 500 }),
          );

          return;
        }

        const headers: Record<string, string> = {};

        for (const [key, value] of Object.entries(videoStream.headers)) {
          if (typeof value === "string") headers[key] = value;
        }

        headers["Cache-Control"] = "public, max-age=100086400, immutable";

        const responseStream = new ReadableStream({
          start(controller) {
            videoStream.on("data", (chunk) => controller.enqueue(chunk));

            videoStream.on("end", () => controller.close());

            videoStream.on("error", (err) => reject(err));
          },
        });

        resolve(
          new NextResponse(responseStream as any, {
            status: videoStream.statusCode || 200,

            headers,
          }),
        );
      })

      .on("error", (err) => {
        console.error("bibash" + err);

        reject(new NextResponse("Error streaming video", { status: 500 }));
      });
  });
}
