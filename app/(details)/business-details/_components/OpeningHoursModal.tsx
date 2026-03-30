"use client";

import { X } from "lucide-react";
import { motion } from "motion/react";

const DAY_LABELS: { key: string; label: string }[] = [
  { key: "sunday", label: "ראשון" },
  { key: "monday", label: "שני" },
  { key: "tuesday", label: "שלישי" },
  { key: "wednesday", label: "רביעי" },
  { key: "thursday", label: "חמישי" },
  { key: "friday", label: "שישי" },
  { key: "saturday", label: "שבת" },
];

// Mapping from your data's day codes to full keys
const DAY_MAP: Record<string, string> = {
  SUN: "sunday",
  MON: "monday",
  TUE: "tuesday",
  WED: "wednesday",
  THU: "thursday",
  FRI: "friday",
  SAT: "saturday",
};

interface OpeningHr {
  day: string;
  open: string;
  close: string;
  isHoliday: boolean;
}

interface Props {
  setShowHoursModal: (v: boolean) => void;
  openingHrs: OpeningHr[];
  isAlwaysOpen: boolean;
}

const OpeningHoursModal = ({
  setShowHoursModal,
  openingHrs,
  isAlwaysOpen,
}: Props) => {
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const today = dayNames[new Date().getDay()];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
      onClick={() => setShowHoursModal(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl shadow-2xl p-8 bg-white"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">שעות פעילות</h3>
          <button
            onClick={() => setShowHoursModal(false)}
            className="p-2 rounded-xl transition-colors hover:bg-gray-100"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {isAlwaysOpen ? (
          <div className="flex items-center justify-center py-4">
            <span className="text-teal-600 font-bold text-lg">פתוח תמיד</span>
          </div>
        ) : (
          <div className="space-y-2">
            {DAY_LABELS.map((day) => {
              const isToday = day.key === today;

              // Find the matching hours using the day code mapping
              const hoursData = openingHrs?.find(
                (h) => DAY_MAP[h.day] === day.key,
              );

              const isClosed =
                !hoursData ||
                hoursData.isHoliday ||
                !hoursData.open ||
                !hoursData.close;

              const displayHours = isClosed
                ? "סגור"
                : `${hoursData.open} - ${hoursData.close}`;

              return (
                <div
                  key={day.key}
                  className={`flex items-center justify-between py-3 px-4 rounded-xl ${
                    isToday ? "bg-teal-50" : "bg-gray-50"
                  }`}
                >
                  <span
                    className={`text-base font-medium ${isToday ? "text-teal-600" : "text-gray-700"}`}
                  >
                    {day.label}
                  </span>
                  <span
                    className={`text-base font-bold ${isToday ? "text-teal-600" : "text-gray-600"}`}
                  >
                    {displayHours}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default OpeningHoursModal;
