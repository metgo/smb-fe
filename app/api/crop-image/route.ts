import sharp from "sharp";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const aspect = parseFloat(searchParams.get("aspect") || "");
  const xMin = parseFloat(searchParams.get("xMin") || "");
  const xMax = parseFloat(searchParams.get("xMax") || "");
  const yMin = parseFloat(searchParams.get("yMin") || "");
  const yMax = parseFloat(searchParams.get("yMax") || "");

  if (
    !url ||
    isNaN(xMin) ||
    isNaN(xMax) ||
    isNaN(yMin) ||
    isNaN(yMax) ||
    isNaN(aspect)
  ) {
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");
    const buffer = Buffer.from(await response.arrayBuffer());

    const image = sharp(buffer);
    const metadata = await image.metadata();

    const displayWidth = metadata.width ?? 0;
    const displayHeight = metadata.height ?? 0;

    // Compute mergedBox-based crop using same logic from client
    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;
    const cropCenterX = centerX * displayWidth;
    const cropCenterY = centerY * displayHeight;

    const maxWidthLeft = cropCenterX;
    const maxWidthRight = displayWidth - cropCenterX;
    const maxHeightTop = cropCenterY;
    const maxHeightBottom = displayHeight - cropCenterY;

    const maxPossibleWidth = Math.min(maxWidthLeft, maxWidthRight) * 2;
    const maxPossibleHeight = Math.min(maxHeightTop, maxHeightBottom) * 2;

    let cropWidth, cropHeight;

    if (maxPossibleWidth / aspect <= maxPossibleHeight) {
      cropWidth = maxPossibleWidth;
      cropHeight = cropWidth / aspect;
    } else {
      cropHeight = maxPossibleHeight;
      cropWidth = cropHeight * aspect;
    }

    cropWidth = Math.min(cropWidth, displayWidth);
    cropHeight = Math.min(cropHeight, displayHeight);

    const cropX = cropCenterX - cropWidth / 2;
    const cropY = cropCenterY - cropHeight / 2;

    const adjustedX = Math.max(0, Math.min(cropX, displayWidth - cropWidth));
    const adjustedY = Math.max(0, Math.min(cropY, displayHeight - cropHeight));

    const left = Math.round(adjustedX);
    const top = Math.round(adjustedY);
    const finalWidth = Math.round(cropWidth);
    const finalHeight = Math.round(cropHeight);

    // Validate final dimensions before calling .extract()
    if (
      finalWidth <= 0 ||
      finalHeight <= 0 ||
      left < 0 ||
      top < 0 ||
      left + finalWidth > displayWidth ||
      top + finalHeight > displayHeight
    ) {
      return NextResponse.json(
        { error: "Invalid crop dimensions. Check mergedBox or aspect ratio." },
        { status: 400 },
      );
    }

    const croppedImage = await image
      .extract({
        left,
        top,
        width: finalWidth,
        height: finalHeight,
      })
      .jpeg()
      .toBuffer();

    return new NextResponse(croppedImage, {
      headers: {
        "Content-Type": "image/jpeg",
      },
    });
  } catch (error) {
    console.error("Sharp error during extract:", error);
    return NextResponse.json(
      {
        error:
          "Failed to crop image. Please check the coordinates and aspect ratio.",
      },
      { status: 500 },
    );
  }
}
