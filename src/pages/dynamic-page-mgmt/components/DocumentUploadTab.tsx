import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { FileSlot, IUploadedFile, PageFormData } from "../types";
import FileUploadSlot from "./FileUploadSlot";
import PdfPreviewModal from "./PdfPreviewModal";
import { canPreview } from "../utils";

interface DocumentUploadTabProps {
  currentForm: PageFormData;
  currentErrors: Partial<PageFormData>;
  uploadedFiles: {
    primary: IUploadedFile | null;
    secondary: IUploadedFile | null;
  };
  isDragging: FileSlot | null;
  previewOpen: FileSlot | null;
  onUpdateField: (field: keyof PageFormData, value: string) => void;
  onFileChange: (files: FileList | null, slot: FileSlot) => void;
  onRemoveFile: (slot: FileSlot) => void;
  onPreview: (slot: FileSlot) => void;
  onDownload: (slot: FileSlot) => void;
  onSetDragging: (slot: FileSlot | null) => void;
  onSetPreviewOpen: (slot: FileSlot | null) => void;
}

export default function DocumentUploadTab({
  currentForm,
  currentErrors,
  uploadedFiles,
  isDragging,
  previewOpen,
  onUpdateField,
  onFileChange,
  onRemoveFile,
  onPreview,
  onDownload,
  onSetDragging,
  onSetPreviewOpen,
}: DocumentUploadTabProps) {
  const { t } = useTranslation("dynamic_pages");
  const { textPrimary, textTertiary, inputClasses } = useThemeClasses();

  const handlePreviewSlot = (slot: FileSlot) => {
    const file = uploadedFiles[slot];
    if (!file?.gcsUrl) return;
    if (canPreview(file.name)) {
      onSetPreviewOpen(slot);
    } else {
      onPreview(slot);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title + Subtitle */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={clsx("block text-sm font-medium", textPrimary)}>
            {t("field_title")} <span className="text-red-500">*</span>
          </label>
          <Input
            value={currentForm.title}
            onChange={(e) => onUpdateField("title", e.target.value)}
            placeholder={t("field_title_placeholder_privacy")}
            className={clsx(
              inputClasses,
              currentErrors.title && "border-red-500 focus:ring-red-400",
            )}
          />
          {currentErrors.title && (
            <p className="text-xs text-red-500">{currentErrors.title}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className={clsx("block text-sm font-medium", textPrimary)}>
            {t("field_subtitle")}{" "}
            <span className={clsx("text-xs font-normal", textTertiary)}>
              {t("field_subtitle_optional")}
            </span>
          </label>
          <Input
            value={currentForm.subTitle}
            onChange={(e) => onUpdateField("subTitle", e.target.value)}
            placeholder={t("field_subtitle_placeholder")}
            className={clsx(inputClasses)}
          />
        </div>
      </div>

      {/* Primary & Secondary file upload slots */}
      <div className="grid grid-cols-2 gap-4">
        {(["primary", "secondary"] as FileSlot[]).map((slot) => (
          <FileUploadSlot
            key={slot}
            slot={slot}
            label={
              slot === "primary"
                ? t("label_primary_file") || "Primary File"
                : t("label_secondary_file") || "Secondary File"
            }
            uploadedFile={uploadedFiles[slot]}
            isDragging={isDragging === slot}
            onDragOver={() => onSetDragging(slot)}
            onDragLeave={() => onSetDragging(null)}
            onDrop={(files) => {
              onSetDragging(null);
              onFileChange(files, slot);
            }}
            onFileChange={(files) => onFileChange(files, slot)}
            onPreview={() => handlePreviewSlot(slot)}
            onDownload={() => onDownload(slot)}
            onRemove={() => onRemoveFile(slot)}
          />
        ))}
      </div>

      {/* PDF Preview Modal */}
      {previewOpen && uploadedFiles[previewOpen]?.gcsUrl && (
        <PdfPreviewModal
          file={uploadedFiles[previewOpen]!}
          onClose={() => onSetPreviewOpen(null)}
          onDownload={() => onDownload(previewOpen)}
        />
      )}
    </div>
  );
}
