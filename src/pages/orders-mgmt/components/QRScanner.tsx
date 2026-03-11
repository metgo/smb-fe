import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
interface QRScannerProps {
  onClose: () => void;
}
type QrState = string | null | undefined;
export default function QRScanner({ onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrData, setQrData] = useState<QrState>(undefined);
  const { isDark } = useThemeClasses();
  const { t } = useTranslation("orders");
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationFrameId: number;

    // ── Start camera ───────────────────────────────────────────────
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "environment" },
      })
      .then((stream) => {
        video.srcObject = stream;
        video.play().catch(console.error);
      })
      .catch((err) => {
        console.error("Camera access denied / not available:", err);
      });

    // ── Scanning loop ──────────────────────────────────────────────
    const scan = () => {
      if (video?.readyState === video?.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        //  canvas size matches video
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert", // faster
        });

        if (code) {
          // console.log("QR detected!", code.data);
          setQrData(code.data);
          // stop scanning here
          video.pause();
          cancelAnimationFrame(animationFrameId);
        }
      }

      animationFrameId = requestAnimationFrame(scan);
    };

    video.addEventListener("play", () => {
      scan();
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (video?.srcObject instanceof MediaStream) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  if (qrData) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div
          className={` ${isDark ? "bg-gray-800" : "bg-gray-50"} rounded-2xl max-w-md w-full overflow-hidden shadow-2xl`}
        >
          {/* Header */}
          <div className=" p-3 text-gray-800">
            <h2
              className={`text-xl ${isDark ? "text-gray-300" : "text-gray-900"} `}
            >
              {t("scan_successful")}
            </h2>
          </div>

          {/* Content */}
          <div className="p-3 py-6 space-y-6">
            <div className="text-center text-gray-800 break-all font-mono text-sm bg-gray-100 rounded-lg">
              {qrData}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                {t("done")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative w-full max-w-md mx-auto">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full aspect-square object-cover rounded-lg bg-black"
      />

      {/* Hidden canvas for processing frames */}
      <canvas ref={canvasRef} className="hidden" />

      {/* semi-transparent overlay / scanning box */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-3/5 h-3/5 border-4 border-red-500 rounded-xl opacity-60" />
      </div>
    </div>
  );
}
