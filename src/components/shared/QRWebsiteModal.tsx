import { type FC, useState, useEffect } from "react";
import clsx from "clsx";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";
import { ModalWrapper } from "../wrapper";
import { useTranslation } from "react-i18next";

interface Website {
  name: string;
  url: string;
  logo: string;
}

interface QRWebsiteModalProps {
  open: boolean;
  website: Website | null;
  isDark?: boolean;
  setSelectedWebsite: (v: any) => void;
}

// Fetches an image URL and returns a base64 data URL
async function toDataURL(url: string): Promise<string> {
  const response = await fetch(url, { mode: "cors" });
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Draws an image with rounded corners onto a canvas and returns a data URL
function toRoundedDataURL(
  src: string,
  size: number,
  radius: number,
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = src;
  });
}

export const QRWebsiteModal: FC<QRWebsiteModalProps> = ({
  open,
  website,
  isDark = false,
  setSelectedWebsite,
}) => {
  const { t } = useTranslation("businesses");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!website?.logo) return;
    setLogoDataUrl(null); // reset on website change

    toDataURL(website.logo)
      .then((url) => toRoundedDataURL(url, 50, 20))
      .then(setLogoDataUrl)
      .catch(() => setLogoDataUrl(null)); // fall back to no logo on error
  }, [website?.logo]);

  if (!open || !website) return null;

  const handleDownload = () => {
    const canvas = document.getElementById(
      `qr-canvas-${website.name}`,
    ) as HTMLCanvasElement | null;

    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${website.name.replace(/\s+/g, "_")}_QR.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <ModalWrapper
      onClose={() => setSelectedWebsite(null)}
      height=""
      maxWidth="max-w-md"
    >
      <div className="p-4">
        <div className="text-center space-y-6">
          <h3
            className={clsx(
              "text-xl font-semibold",
              isDark ? "text-white" : "text-gray-900",
            )}
          >
            {website.name}
          </h3>

          <div
            className={clsx(
              "p-5 inline-block mx-auto rounded-2xl border-2",
              isDark ? "border-gray-600" : "border-gray-200",
            )}
          >
            <QRCodeCanvas
              id={`qr-canvas-${website.name}`}
              value={website.url || ""}
              size={220}
              level="Q"
              bgColor={isDark ? "#111827" : "#ffffff"}
              fgColor={isDark ? "#ffffff" : "#000000"}
              // Only pass imageSettings once the logo is available as a data URL
              imageSettings={
                logoDataUrl
                  ? {
                      src: logoDataUrl,
                      x: undefined,
                      y: undefined,
                      height: 50,
                      width: 50,
                      excavate: true,
                      opacity: 1.0,
                    }
                  : undefined
              }
            />
          </div>

          <button
            onClick={handleDownload}
            className={clsx(
              "flex items-center justify-center gap-2 mx-auto px-6 py-3 rounded-lg font-medium transition-colors shadow-sm",
              isDark
                ? "bg-teal-600 hover:bg-teal-500 text-white"
                : "bg-teal-600 hover:bg-teal-700 text-white",
            )}
          >
            <Download className="w-4 h-4" />
            {t("download")}
          </button>

          <p
            className={clsx(
              "text-sm ",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          >
            {t("scanToVisit")}{" "}
            <span className="font-bold text-blue-500 underline">
              {new URL(website.url).hostname}
            </span>
          </p>
        </div>
      </div>
    </ModalWrapper>
  );
};
