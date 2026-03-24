import { useState } from "react";
import clsx from "clsx";
import { Wrench, Download, Loader } from "lucide-react";
import { toast } from "sonner";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface Props {
  formData: SiteSettingsFormData;
  errors: SiteSettingsErrors;
  onChange: (
    field: keyof SiteSettingsFormData,
    value: string | boolean,
  ) => void;
}

const BACKUP_FREQUENCIES: {
  value: SiteSettingsFormData["backupFrequency"];
  label: string;
}[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function Step11Maintenance({
  formData,
  errors,
  onChange,
}: Props) {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const { textPrimary, textSecondary, inputClasses, borderColor, isDark } =
    useThemeClasses();

  const inputCls = clsx(
    "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
    inputClasses,
  );

  const handleManualBackup = async () => {
    setIsBackingUp(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsBackingUp(false);
    toast.success("Backup created successfully!");
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Wrench className="w-5 h-5 text-teal-500" />
        <h2 className={clsx("text-lg font-semibold", textPrimary)}>
          Maintenance & Backup
        </h2>
      </div>

      {/* Maintenance Mode */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={clsx("text-sm font-medium", textPrimary)}>
              Maintenance Mode
            </p>
            <p className={clsx("text-xs mt-0.5", textSecondary)}>
              Show a maintenance page to visitors while you update the site
            </p>
          </div>
          <button
            onClick={() =>
              onChange(
                "maintenanceModeEnabled",
                !formData.maintenanceModeEnabled,
              )
            }
            className={clsx(
              "relative w-12 h-6 rounded-full transition-colors",
              formData.maintenanceModeEnabled
                ? "bg-orange-500"
                : isDark
                  ? "bg-gray-700"
                  : "bg-gray-300",
            )}
          >
            <span
              className={clsx(
                "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                formData.maintenanceModeEnabled
                  ? "translate-x-6"
                  : "translate-x-0.5",
              )}
            />
          </button>
        </div>

        {formData.maintenanceModeEnabled && (
          <div
            className={clsx(
              "flex flex-col gap-2 p-4 rounded-xl border",
              isDark
                ? "border-orange-800 bg-orange-900/20"
                : "border-orange-200 bg-orange-50",
            )}
          >
            <label className={clsx("text-sm font-medium", textPrimary)}>
              Maintenance Message
            </label>
            <textarea
              rows={3}
              value={formData.maintenanceMessage}
              onChange={(e) => onChange("maintenanceMessage", e.target.value)}
              placeholder="We're currently performing scheduled maintenance. We'll be back shortly!"
              className={clsx(inputCls, "resize-none")}
            />
          </div>
        )}
      </div>

      {/* Backup */}
      <div className={clsx("flex flex-col gap-5 pt-4 border-t", borderColor)}>
        <h3
          className={clsx(
            "text-sm font-semibold uppercase tracking-wide",
            textSecondary,
          )}
        >
          Backup Settings
        </h3>

        <div className="flex flex-col gap-2">
          <label className={clsx("text-sm font-medium", textPrimary)}>
            Backup Frequency
          </label>
          <div className="flex gap-3">
            {BACKUP_FREQUENCIES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onChange("backupFrequency", value)}
                className={clsx(
                  "flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                  formData.backupFrequency === value
                    ? "border-teal-500 bg-teal-500/10 text-teal-600"
                    : isDark
                      ? "border-gray-700 text-gray-300 hover:border-gray-600"
                      : "border-gray-300 text-gray-600 hover:border-gray-400",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleManualBackup}
          disabled={isBackingUp}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-teal-500 text-teal-600 hover:bg-teal-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors w-fit"
        >
          {isBackingUp ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isBackingUp ? "Creating Backup…" : "Manual Backup Now"}
        </button>
      </div>
    </div>
  );
}
