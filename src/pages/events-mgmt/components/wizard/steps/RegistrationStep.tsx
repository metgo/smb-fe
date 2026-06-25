import { useEffect } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  Plus,
  Trash2,
  AlertCircle,
  Users,
  Infinity as InfinityIcon,
} from "lucide-react";

interface RegistrationStepProps {
  registrationRequired: boolean;
  setRegistrationRequired: React.Dispatch<React.SetStateAction<boolean>>;
  capacityType: "limited" | "unlimited";
  setCapacityType: React.Dispatch<
    React.SetStateAction<"limited" | "unlimited">
  >;
  capacity: number;
  setCapacity: React.Dispatch<React.SetStateAction<number>>;
  customQuestions: CustomQuestion[];
  setCustomQuestions: React.Dispatch<React.SetStateAction<CustomQuestion[]>>;
  addCustomQuestion: () => void;
  markDirty: (step: number) => void;
  errors: { capacity?: string };
}

const RegistrationStep: React.FC<RegistrationStepProps> = ({
  markDirty,
  registrationRequired,
  setRegistrationRequired,
  capacityType,
  setCapacityType,
  capacity,
  setCapacity,
  customQuestions,
  setCustomQuestions,
  addCustomQuestion,
  errors,
}) => {
  const { t } = useTranslation("events");
  const {
    textPrimary,
    textSecondary,
    textTertiary,
    bgPrimary,
    inputClasses,
    isDark,
  } = useThemeClasses();

  useEffect(() => {
    markDirty(4);
  }, [
    registrationRequired,
    capacityType,
    capacity,
    customQuestions,
    markDirty,
  ]);

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* ── Registration toggle ──────────────────────────────────────── */}
      <div
        className={clsx(
          "flex items-center justify-between p-6 rounded-xl",
          bgPrimary,
        )}
      >
        <div>
          <h3 className={`text-xl font-semibold ${textPrimary}`}>
            {t("registration_required")}
          </h3>
          <p className={`text-sm mt-1 ${textTertiary}`}>
            {t("do_attendees_need_to_register")}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={registrationRequired}
            onChange={(e) => setRegistrationRequired(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600" />
        </label>
      </div>

      {registrationRequired ? (
        <>
          {/* ── Capacity ─────────────────────────────────────────────── */}
          <div>
            <label
              className={`block text-sm font-medium mb-4 ${textSecondary}`}
            >
              {t("event_capacity")}
            </label>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <button
                onClick={() => setCapacityType("unlimited")}
                className={`px-6 py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                  capacityType === "unlimited"
                    ? "border-teal-500 bg-teal-500/10 text-teal-500 shadow-lg shadow-teal-500/10"
                    : isDark
                      ? "border-gray-700 hover:bg-gray-800/50 text-white/70"
                      : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <InfinityIcon className="w-7 h-7" />
                <span className="text-base font-medium">{t("unlimited")}</span>
              </button>

              <button
                onClick={() => setCapacityType("limited")}
                className={`px-6 py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                  capacityType === "limited"
                    ? "border-teal-500 bg-teal-500/10 text-teal-500 shadow-lg shadow-teal-500/10"
                    : isDark
                      ? "border-gray-700 hover:bg-gray-800/50 text-white/70"
                      : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Users className="w-7 h-7" />
                <span className="text-base font-medium">{t("limited")}</span>
              </button>
            </div>

            {capacityType === "limited" && (
              <div>
                <input
                  type="number"
                  value={capacity || ""}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                  placeholder={t("maximum_attendees")}
                  min="1"
                  className={clsx(
                    "w-full px-5 py-3 rounded-xl border text-lg font-medium text-center focus:ring-2 focus:ring-teal-500/20",
                    inputClasses,
                    errors.capacity && "border-red-500",
                  )}
                />
                {errors.capacity && (
                  <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
                )}
              </div>
            )}
          </div>

          {/* ── Custom Questions ──────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-lg font-semibold ${textSecondary}`}>
                {t("custom_questions")}
              </h3>
              <button
                onClick={addCustomQuestion}
                className="flex items-center gap-2 text-teal-500 hover:text-teal-600 font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t("add_question")}
              </button>
            </div>

            <div className="space-y-4">
              {customQuestions.length === 0 ? (
                <div
                  className={clsx(
                    "text-center py-10 rounded-xl border-2 border-dashed",
                    isDark ? "border-gray-700" : "border-gray-200",
                    textTertiary,
                  )}
                >
                  <p className="text-sm">{t("no_custom_questions_yet")}</p>
                  <button
                    onClick={addCustomQuestion}
                    className="mt-3 text-sm text-teal-500 hover:underline"
                  >
                    {t("add_question")}
                  </button>
                </div>
              ) : (
                customQuestions.map((q, index) => (
                  <div
                    key={q.id}
                    className={clsx(
                      "p-5 rounded-xl border",
                      isDark
                        ? "border-gray-700 bg-gray-800/50"
                        : "border-gray-200 bg-gray-50",
                    )}
                  >
                    <div className="flex gap-4 items-start">
                      <input
                        type="text"
                        value={q.label}
                        onChange={(e) => {
                          const updated = [...customQuestions];
                          updated[index] = {
                            ...updated[index],
                            label: e.target.value,
                          };
                          setCustomQuestions(updated);
                        }}
                        placeholder={t("question_placeholder")}
                        className={`flex-1 px-4 py-3 rounded-lg border ${inputClasses}`}
                      />
                      <select
                        value={q.type}
                        onChange={(e) => {
                          const updated = [...customQuestions];
                          updated[index] = {
                            ...updated[index],
                            type: e.target.value as CustomQuestion["type"],
                          };
                          setCustomQuestions(updated);
                        }}
                        className={`px-4 py-3 rounded-lg border ${inputClasses}`}
                      >
                        <option value="text">{t("text")}</option>
                        <option value="textarea">{t("textarea")}</option>
                        <option value="checkbox">{t("checkbox")}</option>
                      </select>
                      <button
                        onClick={() =>
                          setCustomQuestions(
                            customQuestions.filter((_, i) => i !== index),
                          )
                        }
                        className="p-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title={t("delete_question")}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        /* ── No registration info box ─────────────────────────────────── */
        <div
          className={clsx(
            "p-10 rounded-xl border-2 border-dashed text-center",
            isDark
              ? "border-gray-700 bg-gray-800/30"
              : "border-gray-300 bg-gray-50",
          )}
        >
          <AlertCircle
            className={clsx("w-16 h-16 mx-auto mb-4 opacity-60", textTertiary)}
          />
          <p className={textTertiary}>{t("free_access_info")}</p>
        </div>
      )}
    </div>
  );
};

export default RegistrationStep;
