import { useTranslation } from "react-i18next";
import { Send, Clock, Upload, Download, Copy } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { MiniCampaignFormData } from "../../hooks/useMiniCampaignWizard";

interface VoucherCreationStepProps {
  formData: MiniCampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<MiniCampaignFormData>>;
  uploadedFile: File | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInstanceVoucherAdd: () => void;
  downloadSampleXLS: () => void;
  copyMiniSiteUrl: () => void;
}

export default function VoucherCreationStep({
  formData,
  setFormData,
  uploadedFile,
  handleFileUpload,
  handleInstanceVoucherAdd,
  downloadSampleXLS,
  copyMiniSiteUrl,
}: VoucherCreationStepProps) {
  const { t } = useTranslation("mini_campaign");
  const {
    textPrimary,
    textSecondary,
    textTertiary,
    bgPrimary,
    bgSecondary,
    borderColor,
  } = useThemeClasses();

  return (
    <div className="space-y-6">
      <h3 className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}>
        <Send className="w-5 h-5" />
        {t("voucher_creation")}
      </h3>

      {/* Send Timing */}
      <div>
        <label className={`block text-sm ${textSecondary} mb-3`}>
          {t("send_timing")}
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sendTiming"
              checked={formData.sendTiming === "immediate"}
              onChange={() =>
                setFormData((prev) => ({ ...prev, sendTiming: "immediate" }))
              }
              className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
            />
            <span className={textSecondary}>{t("immediately")}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sendTiming"
              checked={formData.sendTiming === "scheduled"}
              onChange={() =>
                setFormData((prev) => ({ ...prev, sendTiming: "scheduled" }))
              }
              className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
            />
            <Clock className="w-4 h-4" />
            <span className={textSecondary}>{t("scheduled")}</span>
          </label>
        </div>
      </div>

      {formData.sendTiming === "scheduled" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("date")}
            </label>
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  scheduledDate: e.target.value,
                }))
              }
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
          </div>
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("time")}
            </label>
            <input
              type="time"
              value={formData.scheduledTime}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  scheduledTime: e.target.value,
                }))
              }
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
          </div>
        </div>
      )}

      {/* File Upload */}
      <div
        className={`${bgSecondary} rounded-lg p-6 border-2 border-dashed ${borderColor}`}
      >
        <h4 className={`${textPrimary} mb-3 flex items-center gap-2`}>
          <Upload className="w-5 h-5" />
          {t("upload_recipients")}
        </h4>
        <p className={`text-sm ${textTertiary} mb-4`}>
          {t("upload_recipients_desc")}
        </p>
        <div className="flex gap-3">
          <label
            className={`px-4 py-2 rounded-lg bg-purple-600 text-white cursor-pointer hover:bg-purple-700 transition-colors flex items-center gap-2`}
          >
            <Upload className="w-4 h-4" />
            {uploadedFile ? uploadedFile.name : t("choose_file")}
            <input
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={downloadSampleXLS}
            className={`px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} hover:${textPrimary} transition-colors flex items-center gap-2`}
          >
            <Download className="w-4 h-4" />
            {t("download_sample")}
          </button>
        </div>
      </div>

      {/* Instance Voucher Creation */}
      <div className={`${bgSecondary} rounded-lg p-6 border ${borderColor}`}>
        <label className="flex items-center gap-3 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.allowInstanceCreation}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                allowInstanceCreation: e.target.checked,
              }))
            }
            className="w-5 h-5 text-purple-600 focus:ring-2 focus:ring-purple-500 rounded"
          />
          <span className={textPrimary}>{t("allow_instance_creation")}</span>
        </label>

        {formData.allowInstanceCreation && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={formData.instanceName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    instanceName: e.target.value,
                  }))
                }
                placeholder={t("name")}
                className={`px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              <input
                type="email"
                value={formData.instanceEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    instanceEmail: e.target.value,
                  }))
                }
                placeholder={t("email")}
                className={`px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              <input
                type="tel"
                value={formData.instancePhone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    instancePhone: e.target.value,
                  }))
                }
                placeholder={t("phone")}
                className={`px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>
            <button
              onClick={handleInstanceVoucherAdd}
              className={`w-full px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors`}
            >
              {t("add_recipient")}
            </button>
          </div>
        )}
      </div>

      {/* Copy Mini-Site URL */}
      {formData.createMiniSite && (
        <div className={`${bgSecondary} rounded-lg p-4 border ${borderColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <p className={`text-sm ${textTertiary} mb-1`}>
                {t("mini_site_url")}
              </p>
              <p className={`text-sm ${textPrimary} font-mono truncate`}>
                https://tav-8.co.il/mini-site?campCode={formData.campaignCode}
              </p>
            </div>
            <button
              onClick={copyMiniSiteUrl}
              className={`px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} hover:${textPrimary} transition-colors flex items-center gap-2 flex-shrink-0`}
            >
              <Copy className="w-4 h-4" />
              {t("copy")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
