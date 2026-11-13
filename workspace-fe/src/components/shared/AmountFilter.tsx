import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { useAppSelector } from "@/hooks/hooks";

interface AmountFilterProps {
  /** Committed value, kept as a string so an empty field stays empty. */
  value: string;
  onChange: (amount: string) => void;
  /** i18n namespace holding the `amount` / `amount_placeholder` keys. */
  namespace?: string;
}

// Dedicated exact-amount filter, deliberately separate from the free-text
// search box so typing a number doesn't also match rows whose email / phone
// happens to contain the same digits. Debounces locally before pushing up.
export default function AmountFilter({
  value,
  onChange,
  namespace = "orders",
}: AmountFilterProps) {
  const { theme, isRTL } = useAppSelector((state) => state.settings);
  const { t } = useTranslation(namespace);
  const isDark = theme === "dark";

  const [local, setLocal] = useState(value);
  const lastPushed = useRef(value);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Pick up external resets (e.g. "Clear all") without clobbering typing.
  useEffect(() => {
    if (value !== lastPushed.current) {
      setLocal(value);
      lastPushed.current = value;
    }
  }, [value]);

  // Debounce: propagate up after 400 ms of inactivity.
  useEffect(() => {
    const handler = setTimeout(() => {
      if (local !== lastPushed.current) {
        lastPushed.current = local;
        onChangeRef.current(local);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [local]);

  // digits and a single decimal point only
  const sanitize = (v: string) => {
    const cleaned = v.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    return parts.length > 2
      ? `${parts[0]}.${parts.slice(1).join("")}`
      : cleaned;
  };

  return (
    <div>
      <label
        className={`block text-sm mb-1 ${
          isDark ? "text-gray-400" : "text-gray-600"
        } ${isRTL ? "text-right" : ""}`}
      >
        {t("amount")}
      </label>
      <div className="relative">
        <span
          className={`absolute ${
            isRTL ? "right-3" : "left-3"
          } top-1/2 -translate-y-1/2 text-sm leading-none pointer-events-none ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}
        >
          ₪
        </span>
        <input
          type="text"
          inputMode="decimal"
          placeholder={t("amount_placeholder")}
          value={local}
          onChange={(e) => setLocal(sanitize(e.target.value))}
          className={`w-full ${
            isRTL ? "pr-9 pl-8" : "pl-9 pr-8"
          } py-2 rounded-lg border transition-colors ${
            isRTL ? "text-right" : ""
          } ${
            isDark
              ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
          } focus:outline-none focus:ring-2 focus:ring-teal-500`}
        />
        {local && (
          <X
            size={16}
            onClick={() => setLocal("")}
            className={`absolute ${
              isRTL ? "left-2.5" : "right-2.5"
            } top-1/2 -translate-y-1/2 cursor-pointer ${
              isDark
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-500 hover:text-black"
            }`}
          />
        )}
      </div>
    </div>
  );
}
