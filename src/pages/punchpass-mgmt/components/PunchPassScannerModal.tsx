import clsx from "clsx";
import jsQR from "jsqr";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CameraOff,
  CalendarClock,
  CreditCard,
  Loader2,
  Mail,
  Minus,
  Phone,
  Plus,
  QrCode,
  RotateCcw,
  Search,
  User,
} from "lucide-react";

import { ConfirmDialog } from "@/components/shared";
import { formatDate } from "@/helpers/formatter";
import { ModalWrapper } from "@/components/wrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useGetPunchCardLookupQuery,
  useRedeemPunchCardMutation,
} from "@/store/api/punchPassApi";
import { getTradeStatusColor } from "../details/components/PunchPassTradeDetailModal";

export type TPunchPassLookup =
  { type: "qr"; value: string } | { type: "cardNumber"; value: string };

type TScanTab = TPunchPassLookup["type"];
type TCameraError = "permission_denied" | "not_available" | null;

type TLookupItem = IPunchCardLookupRes["items"][number];
// itemId -> number of punches to redeem
type TRedeemSelection = Record<string, number>;

interface PunchPassScannerModalProps {
  onClose: () => void;
}

// ─── Camera + QR decode ──────────────────────────────────────────────
interface QRCameraProps {
  onDetected: (value: string) => void;
}

const QRCamera: React.FC<QRCameraProps> = ({ onDetected }) => {
  const { t } = useTranslation("punch_pass");
  const { textTertiary } = useThemeClasses();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState<TCameraError>(null);
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let stream: MediaStream | null = null;
    let animationFrameId = 0;
    let cancelled = false;

    const stopStream = () => {
      cancelAnimationFrame(animationFrameId);
      stream?.getTracks().forEach((track) => track.stop());
    };

    const scan = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d", { willReadFrequently: true });

      if (canvas && ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code?.data) {
          stopStream();
          onDetected(code.data);
          return;
        }
      }

      animationFrameId = requestAnimationFrame(scan);
    };

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("not_available");
      setIsStarting(false);
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((mediaStream) => {
        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = mediaStream;
        video.srcObject = mediaStream;
        return video.play().then(() => {
          setIsStarting(false);
          scan();
        });
      })
      .catch((err: DOMException) => {
        if (cancelled) return;
        console.error("Camera access denied / not available:", err);
        setCameraError(
          err?.name === "NotAllowedError"
            ? "permission_denied"
            : "not_available",
        );
        setIsStarting(false);
      });

    return () => {
      cancelled = true;
      stopStream();
      video.srcObject = null;
    };
  }, [onDetected]);

  if (cameraError) {
    return (
      <div className="w-full aspect-square rounded-xl bg-gray-500/10 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <CameraOff className="w-12 h-12 text-gray-400" />
        <p className={clsx("text-sm", textTertiary)}>
          {t(
            cameraError === "permission_denied"
              ? "camera_permission_denied"
              : "camera_not_available",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Scan frame + laser */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-3/5 h-3/5 border-4 border-teal-400/80 rounded-2xl overflow-hidden">
          {!isStarting && (
            <div className="absolute inset-x-2 h-0.5 -translate-y-1/2 rounded-full bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.8)] animate-scan-laser" />
          )}
        </div>
      </div>

      {isStarting && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-300">
          {t("starting_camera")}
        </div>
      )}
    </div>
  );
};

// ─── Lookup result: card info + redeemable items ─────────────────────
interface ItemStepperRowProps {
  item: TLookupItem;
  count: number;
  onChange: (count: number) => void;
}

const ItemStepperRow: React.FC<ItemStepperRowProps> = ({
  item,
  count,
  onChange,
}) => {
  const { t } = useTranslation("punch_pass");
  const { isDark, textPrimary, textTertiary, borderColor } = useThemeClasses();
  const isExhausted = item.remainingCount <= 0;

  const stepBtn = clsx(
    "w-8 h-8 flex items-center justify-center rounded-lg border transition-colors cursor-pointer",
    "disabled:opacity-40 disabled:cursor-not-allowed",
    isDark
      ? "border-gray-700 hover:bg-gray-800 text-gray-200"
      : "border-gray-300 hover:bg-gray-100 text-gray-700",
  );

  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-3 p-3 rounded-xl border",
        borderColor,
        count > 0 && "border-teal-500/70 bg-teal-500/5",
        isExhausted && "opacity-60",
      )}
    >
      <div className="min-w-0">
        <p className={clsx("text-sm font-medium truncate", textPrimary)}>
          {item.label}
        </p>
        <p className={clsx("text-xs mt-0.5", textTertiary)}>
          {t("remaining_of_total", {
            remaining: item.remainingCount,
            total: item.quantity,
          })}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          aria-label={t("decrease")}
          disabled={count <= 0}
          onClick={() => onChange(count - 1)}
          className={stepBtn}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span
          className={clsx(
            "w-6 text-center text-sm font-semibold tabular-nums",
            textPrimary,
          )}
        >
          {count}
        </span>
        <button
          type="button"
          aria-label={t("increase")}
          disabled={count >= item.remainingCount}
          onClick={() => onChange(count + 1)}
          className={stepBtn}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface PunchCardLookupResultProps {
  card: IPunchCardLookupRes;
  onReset: () => void;
  resetLabel: string;
}

const PunchCardLookupResult: React.FC<PunchCardLookupResultProps> = ({
  card,
  onReset,
  resetLabel,
}) => {
  const { t } = useTranslation("punch_pass");
  const { isDark, textPrimary, textTertiary, borderColor, language } =
    useThemeClasses();

  const [selection, setSelection] = useState<TRedeemSelection>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [redeemPunchCard, { isLoading: isRedeeming }] =
    useRedeemPunchCardMutation();

  const items = useMemo(() => card.items ?? [], [card.items]);
  const selectedItems = useMemo(
    () => items.filter((item) => (selection[item._id] ?? 0) > 0),
    [items, selection],
  );
  const totalSelected = selectedItems.reduce(
    (sum, item) => sum + selection[item._id],
    0,
  );

  const handleCountChange = (itemId: string, count: number) => {
    setSelection((prev) => ({ ...prev, [itemId]: count }));
  };

  const handleConfirm = async () => {
    try {
      await redeemPunchCard({
        punchCardId: card.punchCardId,
        payload: {
          items: selectedItems.map((item) => ({
            itemIndex: item.itemIndex,
            quantity: selection[item._id],
          })),
        },
      }).unwrap();
      toast.success(t("redeem_success"));
      // Lookup is re-fetched via tag invalidation; start the new counts from zero
      setSelection({});
      setIsConfirmOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || t("redeem_failed"));
    }
  };

  const confirmMessage = t("confirm_redeem_message", {
    items: selectedItems
      .map((item) => `${selection[item._id]} × ${item.label}`)
      .join(", "),
    cardNumber: card.cardNumber,
  });

  const infoRow = (icon: React.ReactNode, value?: string) =>
    value ? (
      <div className={clsx("flex items-center gap-2 text-sm", textTertiary)}>
        {icon}
        <span className="truncate">{value}</span>
      </div>
    ) : null;

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Card summary */}
        <div
          className={clsx(
            "rounded-xl border p-4 flex flex-col gap-2",
            borderColor,
            isDark ? "bg-gray-800/40" : "bg-gray-50",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={clsx("font-semibold truncate", textPrimary)}>
                {card.punchPassName}
              </p>
              <p className={clsx("text-xs font-mono mt-0.5", textTertiary)}>
                #{card.cardNumber}
              </p>
            </div>
            {card.status && (
              <span
                className={clsx(
                  "px-2 py-0.5 rounded-full border text-xs capitalize shrink-0",
                  getTradeStatusColor(card.status, isDark),
                )}
              >
                {card.status}
              </span>
            )}
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {infoRow(<User className="w-4 h-4 shrink-0" />, card.purchaserName)}
            {infoRow(<Phone className="w-4 h-4 shrink-0" />, card.phone)}
            {infoRow(<Mail className="w-4 h-4 shrink-0" />, card.email)}
            {infoRow(
              <CalendarClock className="w-4 h-4 shrink-0" />,
              card.validUntil &&
                `${t("valid_until")}: ${formatDate(card.validUntil, language)}`,
            )}
          </div>
        </div>

        {/* Items */}
        <div className="flex flex-col gap-2">
          <p className={clsx("text-sm font-medium", textPrimary)}>
            {t("select_items_to_redeem")}
          </p>
          {items.length === 0 ? (
            <p className={clsx("text-sm text-center py-4", textTertiary)}>
              {t("no_redemption_items")}
            </p>
          ) : (
            items.map((item) => (
              <ItemStepperRow
                key={item._id}
                item={item}
                count={selection[item._id] ?? 0}
                onChange={(count) => handleCountChange(item._id, count)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onReset}
            className={clsx(
              "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors cursor-pointer",
              isDark
                ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                : "border-gray-300 hover:bg-gray-100 text-gray-700",
            )}
          >
            <RotateCcw className="w-4 h-4" />
            {resetLabel}
          </button>
          <button
            type="button"
            disabled={totalSelected === 0}
            onClick={() => setIsConfirmOpen(true)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-linear-to-r from-teal-500 to-cyan-600 text-white font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {totalSelected > 0
              ? t("redeem_count", { count: totalSelected })
              : t("redeem")}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        variant="info"
        title={t("confirm_redeem_title")}
        message={confirmMessage}
        confirmText={t("redeem")}
        loading={isRedeeming}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
};

// ─── Modal ───────────────────────────────────────────────────────────
const PunchPassScannerModal: React.FC<PunchPassScannerModalProps> = ({
  onClose,
}) => {
  const { t } = useTranslation("punch_pass");
  const {
    isDark,
    textPrimary,
    textTertiary,
    borderColor,
    inputClasses,
    language,
  } = useThemeClasses();

  const [activeTab, setActiveTab] = useState<TScanTab>("qr");
  const [cardNumber, setCardNumber] = useState("");
  const [lookup, setLookup] = useState<TPunchPassLookup | null>(null);

  // Same lookup endpoint for both a scanned QR value and a typed card number
  const {
    data: card,
    isFetching,
    isError,
    error,
  } = useGetPunchCardLookupQuery(
    lookup ? { code: lookup.value, language } : skipToken,
    { refetchOnMountOrArgChange: true },
  );

  const handleDetected = useCallback((value: string) => {
    setLookup({ type: "qr", value });
  }, []);

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = cardNumber.trim();
    if (!value) return;
    setLookup({ type: "cardNumber", value });
  };

  const handleTabChange = (tab: TScanTab) => {
    setActiveTab(tab);
    setLookup(null);
  };

  const handleReset = () => {
    setLookup(null);
    setCardNumber("");
  };

  const resetLabel = t(lookup?.type === "qr" ? "scan_again" : "search_again");

  const tabs: { id: TScanTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "qr",
      label: t("scan_qr_code"),
      icon: <QrCode className="w-4 h-4" />,
    },
    {
      id: "cardNumber",
      label: t("enter_card_number"),
      icon: <CreditCard className="w-4 h-4" />,
    },
  ];

  const renderLookup = () => {
    if (isFetching) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          <p className={clsx("text-sm", textTertiary)}>
            {t("looking_up_punch_card")}
          </p>
        </div>
      );
    }

    if (isError || !card) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        t("punch_card_not_found");
      return (
        <div
          className={clsx(
            "rounded-xl border p-5 flex flex-col items-center gap-3 text-center",
            borderColor,
          )}
        >
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className={clsx("text-sm", textPrimary)}>{message}</p>
          <p
            className={clsx(
              "font-mono text-xs break-all px-3 py-1.5 rounded-lg",
              isDark ? "bg-gray-800" : "bg-gray-100",
              textTertiary,
            )}
          >
            {lookup?.value}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className={clsx(
              "mt-1 flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors cursor-pointer",
              isDark
                ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                : "border-gray-300 hover:bg-gray-100 text-gray-700",
            )}
          >
            <RotateCcw className="w-4 h-4" />
            {resetLabel}
          </button>
        </div>
      );
    }

    return (
      <PunchCardLookupResult
        key={card._id}
        card={card}
        onReset={handleReset}
        resetLabel={resetLabel}
      />
    );
  };

  return (
    <ModalWrapper onClose={onClose} maxWidth="max-w-md" height="h-auto">
      <div className="flex flex-col p-3 gap-5 max-h-[85dvh] overflow-y-auto">
        <div>
          <h1 className={clsx("text-2xl font-semibold", textPrimary)}>
            {t("scan_punch_pass")}
          </h1>
          <p className={clsx("text-sm mt-1", textTertiary)}>
            {t("scan_punch_pass_desc")}
          </p>
        </div>

        {/* Tabs */}
        <div
          className={clsx(
            "grid grid-cols-2 gap-1 p-1 rounded-xl border",
            borderColor,
            isDark ? "bg-gray-800/60" : "bg-gray-100",
          )}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={clsx(
                "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                activeTab === tab.id
                  ? "bg-linear-to-r from-teal-500 to-cyan-600 text-white shadow"
                  : isDark
                    ? "text-gray-300 hover:bg-gray-700/60"
                    : "text-gray-700 hover:bg-white",
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {lookup ? (
          renderLookup()
        ) : activeTab === "qr" ? (
          <div className="flex flex-col gap-3">
            <QRCamera onDetected={handleDetected} />
            <p className={clsx("text-sm text-center", textTertiary)}>
              {t("scan_qr_hint")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleCardSubmit} className="flex flex-col gap-3">
            <label className={clsx("text-sm font-medium", textPrimary)}>
              {t("card_number")}
            </label>
            <input
              autoFocus
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder={t("PP-20XX-XXXXXXXX")}
              className={clsx(
                "w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-teal-500",
                inputClasses,
              )}
            />
            <button
              type="submit"
              disabled={!cardNumber.trim()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-linear-to-r from-teal-500 to-cyan-600 text-white font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Search className="w-4 h-4" />
              {t("find_punch_card")}
            </button>
          </form>
        )}
      </div>
    </ModalWrapper>
  );
};

export default PunchPassScannerModal;
