import React from "react";
import { Send, Clock, Download, Upload } from "lucide-react";

interface MinisiteVoucherCreationProps {
  t: any;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  contactName: string; // still passed separately (from earlier steps)
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  downloadSampleXLS: () => void;
  handleInstanceVoucherAdd: () => void; // parent will handle adding → clear fields after
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  bgPrimary: string;
  bgSecondary: string;
  borderColor: string;
}

export const MinisiteVoucherCreation: React.FC<
  MinisiteVoucherCreationProps
> = ({
  t,
  formData,
  setFormData,
  contactName,
  email,
  phoneCountryCode,
  phoneNumber,
  downloadSampleXLS,
  handleInstanceVoucherAdd,
  textPrimary,
  textSecondary,
  textTertiary,
  bgPrimary,
  bgSecondary,
  borderColor,
}) => {
  const update = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    update({ uploadedFile: file });
  };

  return (
    <div className="space-y-6">
      <h3 className={`text-lg ${textPrimary} mb-4`}>
        {t.voucherCreation || "Voucher Creation & Distribution"}
      </h3>

      {/* Voucher Sender Info – still read-only from previous step */}
      <div className={`${bgSecondary} rounded-lg p-4`}>
        <h4 className={`${textPrimary} mb-3`}>
          {t.voucherSenderInfo || "Voucher Sender Info"}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm ${textTertiary} mb-1`}>
              {t.name || "Name"}
            </label>
            <p className={textPrimary}>{formData.contactName || "-"}</p>
          </div>
          <div>
            <label className={`block text-sm ${textTertiary} mb-1`}>
              {t.email || "Email"}
            </label>
            <p className={textPrimary}>{formData.email || "-"}</p>
          </div>
          <div>
            <label className={`block text-sm ${textTertiary} mb-1`}>
              {t.phone || "Phone"}
            </label>
            <p className={textPrimary}>
              {formData.phoneCountryCode}
              {formData.phoneNumber || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Scheduling */}
      <div>
        <h4 className={`${textPrimary} mb-3`}>
          {t.scheduling || "Scheduling"}
        </h4>
        <div className="flex gap-6 mb-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={formData.sendTiming === "immediate"}
              onChange={() => update({ sendTiming: "immediate" })}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
            />
            <Send className="w-4 h-4" />
            <span className={textSecondary}>
              {t.sendImmediately || "Send Immediately"}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={formData.sendTiming === "scheduled"}
              onChange={() => update({ sendTiming: "scheduled" })}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
            />
            <Clock className="w-4 h-4" />
            <span className={textSecondary}>
              {t.scheduleForLater || "Schedule for Later"}
            </span>
          </label>
        </div>

        {formData.sendTiming === "scheduled" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>
                {t.date || "Date"}
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => update({ scheduledDate: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>
                {t.time || "Time"}
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => update({ scheduledTime: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Voucher Assignment */}
      <div>
        <h4 className={`${textPrimary} mb-3`}>
          {t.voucherAssignment || "Voucher Assignment"}
        </h4>

        {/* Download Sample */}
        <button
          onClick={downloadSampleXLS}
          className={`mb-4 px-4 py-2 rounded-lg ${bgSecondary} ${textSecondary} hover:${textPrimary} transition-colors flex items-center gap-2`}
        >
          <Download className="w-4 h-4" />
          {t.downloadSampleXLS || "Download Sample XLS"}
        </button>

        {/* Bulk Upload */}
        <div className={`${bgSecondary} rounded-lg p-4 mb-4`}>
          <label className={`block text-sm ${textSecondary} mb-2`}>
            {t.bulkUpload || "Bulk Upload (XLS)"}
          </label>
          <label
            className={`px-4 py-2 rounded-lg border-2 border-dashed ${borderColor} ${textSecondary} cursor-pointer hover:${textPrimary} transition-colors flex items-center justify-center gap-2 h-24 text-center`}
          >
            <Upload className="w-5 h-5" />
            <span className="text-sm">
              {formData.uploadedFile
                ? formData.uploadedFile.name
                : t.uploadXLS || "Click to upload XLS file"}
            </span>
            <input
              type="file"
              accept=".xls,.xlsx,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Single/Instance Voucher Creation */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={formData.allowInstanceCreation}
              onChange={(e) =>
                update({ allowInstanceCreation: e.target.checked })
              }
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className={textSecondary}>
              {t.allowInstanceCreation || "Allow Instance Voucher Creation"}
            </span>
          </label>

          {formData.allowInstanceCreation && (
            <div className={`${bgSecondary} rounded-lg p-4`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <input
                    type="text"
                    value={formData.instanceName}
                    onChange={(e) => update({ instanceName: e.target.value })}
                    placeholder={t.name || "Name"}
                    className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={formData.instanceEmail}
                    onChange={(e) => update({ instanceEmail: e.target.value })}
                    placeholder={t.email || "Email"}
                    className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    value={formData.instancePhone}
                    onChange={(e) => update({ instancePhone: e.target.value })}
                    placeholder={t.phone || "Phone"}
                    className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                </div>
              </div>

              <button
                onClick={handleInstanceVoucherAdd}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                {t.addVoucher || "Add Voucher"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
