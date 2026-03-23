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

          <div className={clsx("p-5 inline-block mx-auto")}>
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
              "text-sm pt-2",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          >
            {t("scanToVisit")}{" "}
            <span className="font-medium">{new URL(website.url).hostname}</span>
          </p>
        </div>
      </div>
    </ModalWrapper>
  );
};
