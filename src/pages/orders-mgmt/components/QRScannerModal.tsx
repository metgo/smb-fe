import { useEffect, useRef } from "react";
import { Camera, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/hooks/hooks";
import QRScanner from "./QRScanner";

interface QRScannerModalProps {
  onClose: () => void;
  stream: MediaStream | null;
}

export default function QRScannerModal({
  onClose,
  stream,
}: QRScannerModalProps) {
  const { t } = useTranslation("orders");
  const { isRTL, theme } = useAppSelector((state) => state.settings);
  const textPrimary = theme === "dark" ? "text-gray-100" : "text-gray-900";

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    video.play().catch((e) => console.error("Video play failed:", e));

    video.style.transform = "scaleX(-1)";

    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg rounded-lg overflow-hidden ${
          theme === "dark"
            ? "bg-gray-900 text-gray-100"
            : "bg-white text-gray-900"
        }`}
      >
        <div
          className={`p-6 border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
        >
          <div
            className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <h2 className={`text-2xl ${textPrimary}`}>
              {t("scan_qr_code") || "Scan QR Code"}
            </h2>
            <button onClick={onClose} className="p-2 rounded-lg ">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {stream ? (
            <QRScanner onClose={onClose} />
          ) : (
            <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Camera className="w-24 h-24 text-gray-400" />
            </div>
          )}

          <p className={`text-center mt-4 ${textPrimary}`}>
            {t("qr_scanner_placeholder") || "Camera feed will appear here"}
          </p>
        </div>
      </div>
    </div>
  );
}
