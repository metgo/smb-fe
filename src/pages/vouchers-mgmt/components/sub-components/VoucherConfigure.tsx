import { Download, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
interface Props {
  formData: IVoucherFormData;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  t: any;
  errors?: any;
  parsedData?: ParsedData[];
  setParsedData?: React.Dispatch<React.SetStateAction<ParsedData[]>>;
}

const VoucherConfigure = ({
  formData,
  setFormData,
  t,
  setParsedData,
  errors = {},
}: Props) => {
  const { isDark } = useThemeClasses();
  const [formatData, setFormatData] = useState<ParsedData[]>([]);
  const [_xlsValidation, setXlsValidation] = useState<{
    valid: number;
    invalid: number;
    errors?: any[];
  } | null>(null);

  useEffect(() => {
    if (setParsedData) {
      setParsedData(formatData);
    }
  }, [formatData]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setFormData((prev: any) => ({ ...prev, xlsFile: file }));

      const reader = new FileReader();

      reader.onload = (evt) => {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const formattedData = (jsonData as ParsedData[]).map(
          (row: ParsedData) => ({
            assigneeName: row.AssigneeName || "",
            noOfVoucher: Number(row.NoOfVoucher),
            assigneeEmail: row.AssigneeEmail || "",
            assigneeCountryCode: row.AssigneeCountryCode || "",
            assigneePhone: Number(row.AssigneePhone) || 0,
          }),
        );
        console.log("🚀 ~ handleFileUpload ~ formattedData:", formattedData);

        setXlsValidation({
          valid: formattedData.length,
          invalid: 0,
          errors: [],
        });
        setFormatData(formattedData);
        if (setParsedData) {
          setParsedData(formattedData);
        }
      };

      reader.readAsBinaryString(file);
    }
  };

  const handleDownload = () => {
    const data = [
      [
        "AssigneeName",
        "AssigneeEmail",
        "AssigneeCountryCode",
        "AssigneePhone",
        "NoOfVoucher",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "sample_template.xlsx");
  };

  if (formData.creationType === "single") {
    return (
      <div className="space-y-4">
        <h3
          className={`text-sm mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("assignee_details")}
        </h3>

        {/* Name */}
        <div>
          <label
            className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {t("assignee_name")} *
          </label>

          <input
            type="text"
            value={formData.assigneeName}
            placeholder={t("enter_assignee_name")}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                assigneeName: e.target.value,
              }))
            }
            className={`w-full border rounded px-3 py-2 ${
              isDark
                ? " text-white border-gray-600 placeholder-gray-400"
                : "bg-white text-black border-gray-300"
            }`}
          />

          {errors.assigneeName && (
            <p className="text-red-500 text-xs mt-1">{errors.assigneeName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {t("assignee_email")} *
          </label>

          <input
            type="email"
            value={formData.assigneeEmail}
            placeholder="email@example.com"
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                assigneeEmail: e.target.value,
              }))
            }
            className={`w-full border rounded px-3 py-2 ${
              isDark
                ? " text-white border-gray-600 placeholder-gray-400"
                : "bg-white text-black border-gray-300"
            }`}
          />

          {errors.assigneeEmail && (
            <p className="text-red-500 text-xs mt-1">{errors.assigneeEmail}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {t("assignee_phone")} *
          </label>

          <input
            type="tel"
            value={formData.assigneePhone}
            placeholder="+972-XX-XXXXXXX"
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                assigneePhone: e.target.value,
              }))
            }
            className={`w-full border rounded px-3 py-2 ${
              isDark
                ? " text-white border-gray-600 placeholder-gray-400"
                : "bg-white text-black border-gray-300"
            }`}
          />

          {errors.assigneePhone && (
            <p className="text-red-500 text-xs mt-1">{errors.assigneePhone}</p>
          )}
        </div>
      </div>
    );
  }

  if (formData.creationType === "bulk") {
    return (
      <div className="space-y-4">
        <h3
          className={`text-sm mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("bulk_creation_settings")}
        </h3>

        {/* Bulk Count */}
        <div>
          <label
            className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {t("number_of_vouchers")}
          </label>

          <input
            value={formData.bulkCount}
            min={1}
            max={1000}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                bulkCount: Number(e.target.value),
              }))
            }
            className={`w-full border rounded px-3 py-2 ${
              isDark
                ? " text-white border-gray-600 placeholder-gray-400"
                : "bg-white text-black border-gray-300"
            }`}
          />

          {errors.bulkCount && (
            <p className="text-red-500 text-xs mt-1">{errors.bulkCount}</p>
          )}
        </div>

        {/* Assigned Checkbox */}
        <div
          className={`pt-3 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}
        >
          <label
            className={`flex text-sm mb-1 gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            <input
              type="checkbox"
              checked={formData.bulkCreateAssigned}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  bulkCreateAssigned: e.target.checked,
                }))
              }
            />
            {t("create_assigned_voucher")}
          </label>

          <p
            className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {t("assign_all_vouchers_to_person")}
          </p>
        </div>

        {/* Assigned Inputs */}
        {formData.bulkCreateAssigned && (
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                {t("assignee_name")} *
              </label>

              <input
                type="text"
                value={formData.assigneeName}
                placeholder={t("enter_assignee_name")}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    assigneeName: e.target.value,
                  }))
                }
                className={`w-full border rounded px-3 py-2 ${
                  isDark
                    ? " text-white border-gray-600 placeholder-gray-400"
                    : "bg-white text-black border-gray-300"
                }`}
              />

              {errors.assigneeName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.assigneeName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                {t("assignee_email")} *
              </label>

              <input
                type="email"
                value={formData.assigneeEmail}
                placeholder="email@example.com"
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    assigneeEmail: e.target.value,
                  }))
                }
                className={`w-full border rounded px-3 py-2 ${
                  isDark
                    ? " text-white border-gray-600 placeholder-gray-400"
                    : "bg-white text-black border-gray-300"
                }`}
              />

              {errors.assigneeEmail && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.assigneeEmail}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                {t("assignee_phone")} *
              </label>

              <input
                type="tel"
                value={formData.assigneePhone}
                placeholder="+972-XX-XXXXXXX"
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    assigneePhone: e.target.value,
                  }))
                }
                className={`w-full border rounded px-3 py-2 ${
                  isDark
                    ? " text-white border-gray-600 placeholder-gray-400"
                    : "bg-white text-black border-gray-300"
                }`}
              />

              {errors.assigneePhone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.assigneePhone}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  if (formData.creationType === "upload") {
    return (
      <div className="space-y-4">
        <h3
          className={`text-sm mb-4 ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {t("upload_xls_file")}
        </h3>

        {/* Download Template */}
        <div
          className={`p-4 border rounded ${
            isDark ? "border-gray-700 " : "border-gray-200 bg-white"
          }`}
        >
          <button
            className="flex items-center gap-2 text-teal-500 text-sm"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
            {t("download_sample_xls_template")}
          </button>

          <p
            className={`text-xs mt-1 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {t("use_template_for_correct_format")}
          </p>
        </div>

        {/* Upload Box */}
        <div
          className={`border-2 border-dashed rounded p-6 text-center ${
            isDark ? "border-gray-600 " : "border-gray-300 bg-gray-50"
          }`}
        >
          <Upload
            className={`w-8 h-8 mx-auto mb-2 ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
          />

          <label className="cursor-pointer">
            <span className="text-teal-500">{t("click_to_upload")}</span>

            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {errors.xlsFile && (
            <p className="text-red-500 text-xs mt-2">{errors.xlsFile}</p>
          )}
        </div>

        {/* File Info */}
        {formData.xlsFile && (
          <div
            className={`p-4 border rounded ${
              isDark
                ? "border-gray-700  text-gray-400"
                : "border-gray-200 bg-white"
            }`}
          >
            <p className="text-sm mb-2">
              {t("file")}: {formData.xlsFile.name}
            </p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default VoucherConfigure;
