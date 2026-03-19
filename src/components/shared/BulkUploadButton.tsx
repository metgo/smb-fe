import { useState } from "react";
import { ModalWrapper } from "@/components/wrapper";
import { useTranslation } from "react-i18next";
import { Download, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useCreateVoucherMutation } from "@/store/api/voucherMutationApi";

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkUploadButton = ({ isOpen, onClose }: OrdersModalProps) => {
  const { t } = useTranslation("vouchers");

  const [formData, setFormData] = useState<{ xlsFile?: File }>({});
  const [errors, setErrors] = useState<{ xlsFile?: string }>({});
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [xlsValidation, setXlsValidation] = useState<{
    valid: number;
    invalid: number;
    errors?: any[];
  } | null>(null);

  const [createVoucher, { isLoading: isCreating }] = useCreateVoucherMutation();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setFormData((prev) => ({ ...prev, xlsFile: file }));

      const reader = new FileReader();

      reader.onload = (evt) => {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const formattedData = jsonData.map((row: any) => ({
          assigneeName: row.AssigneeName || "",
          noOfVoucher: Number(row.NoOfVoucher),
          assigneeEmail: row.AssigneeEmail || "",
          assigneeCountryCode: row.AssigneeCountryCode || "",
          assigneePhone: row.AssigneePhone || "",
        }));

        setXlsValidation({
          valid: formattedData.length,
          invalid: 0,
          errors: [],
        });

        setParsedData(formattedData);
      };

      reader.readAsBinaryString(file);
    }
  };

  const handleDownload = () => {
    const data = [
      [
        "Name",
        "CampCode",
        "AssigneeEmail",
        "CountryCode",
        "Phone",
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

  const handleCreateVoucher = async () => {
    if (parsedData.length === 0) {
      setErrors({ xlsFile: t("no_data_to_upload") });
      return;
    }

    try {
      const res = await createVoucher(parsedData).unwrap();
      console.log("Vouchers created successfully:", res);
      setErrors({});
      onClose(); // close modal after success
    } catch (err: any) {
      console.error("Error creating vouchers:", err);
      setErrors({ xlsFile: err?.data?.message || t("something_went_wrong") });
    }
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper
      height=""
      onClose={onClose}
      maxWidth="max-w-4xl"
      showSpinner={isCreating}
    >
      <div className="space-y-4 p-4">
        <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          {t("upload_xls_file")}
        </h3>

        <div className="p-4 border rounded">
          <button
            className="flex items-center gap-2 text-teal-600 text-sm"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
            {t("download_sample_xls_template")}
          </button>

          <p className="text-xs text-gray-500 mt-1">
            {t("use_template_for_correct_format")}
          </p>
        </div>

        <div className="border-2 border-dashed rounded p-6 text-center">
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />

          <label className="cursor-pointer">
            <span className="text-teal-600">{t("click_to_upload")}</span>
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

        {formData.xlsFile && (
          <div className="p-4 border rounded space-y-2">
            <p className="text-sm mb-2">
              {t("file")}: {formData.xlsFile.name}
            </p>

            {xlsValidation && (
              <div className="space-y-1 text-sm">
                <span className="text-green-600">
                  ✓ {t("valid_rows")}: {xlsValidation.valid}
                </span>
                <span className="text-red-600 block">
                  ✗ {t("invalid_rows")}: {xlsValidation.invalid}
                </span>
              </div>
            )}

            <button
              onClick={handleCreateVoucher}
              className="mt-3 w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition"
            >
              {t("create_vouchers")}
            </button>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};
