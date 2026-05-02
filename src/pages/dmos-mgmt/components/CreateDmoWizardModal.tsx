import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LinkIcon, MapPin, Settings2, Upload, X } from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { ModalWrapper } from "@/components/wrapper";
import { useFileUpload } from "@/hooks/useFileUpload";
import BoundaryMap from "@/components/maps/BoundaryMap";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import CircularProgress from "@/components/shared/CircularProgress";
import type {
  GeoJsonPoint,
  GeoJsonPolygon,
} from "@/components/maps/BoundaryMap";

interface CreateDmoWizardModalProps {
  setIsOpen: (v: boolean) => void;
  existingAuthority?: {
    name?: string;
    dmoId?: string;
    description?: string;
    userId?: string;
    isActive?: boolean;
    boundary?: GeoJsonPolygon;
    center?: GeoJsonPoint;
    logoPath?: string;
  };
}

type Tab = "general" | "boundary";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "general",
    label: "General",
    icon: <Settings2 className="w-3.5 h-3.5" />,
  },
  {
    id: "boundary",
    label: "Boundary",
    icon: <MapPin className="w-3.5 h-3.5" />,
  },
];

const CreateDmoWizardModal = ({
  setIsOpen,
  existingAuthority,
}: CreateDmoWizardModalProps) => {
  const { t } = useTranslation("system_mgmt");
  const {
    textPrimary,
    textTertiary,
    isDark,
    bgPrimary,
    bgSecondary,
    borderColor,
  } = useThemeClasses();
  const { user } = useAppSelector((state) => state.auth);

  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [dragOver, setDragOver] = useState(false);

  // ── Form state ────────────────────────────────────────────────────────────
  const [name, setName] = useState(existingAuthority?.name ?? "");
  const [urlValue, setUrlValue] = useState("");

  const [description, setDescription] = useState(
    existingAuthority?.description ?? "",
  );
  const [boundary, setBoundary] = useState<GeoJsonPolygon | null>(
    existingAuthority?.boundary ?? null,
  );
  const [center, setCenter] = useState<GeoJsonPoint | null>(
    existingAuthority?.center ?? null,
  );

  const fileUpload = useFileUpload({
    initialUrl: existingAuthority?.logoPath,
    mediaType: "image",
  });
  const isUploading = fileUpload.status === "uploading";

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) fileUpload.handleFileSelect(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) fileUpload.handleFileSelect(file);
  };

  const handleSave = () => {
    const payload: IDMOPayload = {
      name,
      description,
      userId: user?._id || "",
      isActive: true,
      boundary,
      center,
      logoPath: fileUpload.gcsUrl,
    };
    console.log("🚀 ~ handleSave ~ payload:", payload);
  };

  // ── Shared classes ────────────────────────────────────────────────────────
  const inputCls = `w-full px-4 py-3 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent transition`;

  return (
    <ModalWrapper
      onClose={() => setIsOpen(false)}
      maxWidth="max-w-3xl"
      height="max-content"
    >
      <div className="flex flex-col">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className={`px-5 pt-5 pb-0 border-b ${borderColor}`}>
          <h2 className={`text-base font-bold ${textPrimary} mb-3`}>
            {existingAuthority ? "Edit DMO" : "Create DMO"}
          </h2>

          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                    isSelected
                      ? `border-violet-500 text-violet-600 dark:text-violet-400 ${bgPrimary}`
                      : `border-transparent ${textTertiary} hover:text-violet-500`
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {/* Badge for boundary tab when data is set */}
                  {tab.id === "boundary" && (boundary || center) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab: General ──────────────────────────────────────────────── */}
        {activeTab === "general" && (
          <div className="p-5 space-y-4">
            {/* Name */}
            <div>
              <label
                className={`block text-sm font-semibold mb-1.5 ${textPrimary}`}
              >
                {t("name")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                placeholder={t("title_placeholder")}
              />
            </div>

            {/* Description */}
            <div>
              <label
                className={`block text-sm font-semibold mb-1.5 ${textPrimary}`}
              >
                {t("description")}
              </label>
              <textarea
                rows={3}
                maxLength={300}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputCls} resize-none`}
                placeholder={t("description_placeholder")}
              />
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${textPrimary}`}>
                Logo
              </label>

              {/* ── URL input ─────────────────────────────────────────────────── */}
              <div className="relative">
                <LinkIcon
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textTertiary}`}
                />
                <input
                  type="url"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  placeholder={t("media_url_placeholder")}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition`}
                />
              </div>

              {/* ── "or" divider ──────────────────────────────────────────────── */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex-1 h-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
                />
                <span className={`text-xs font-medium ${textTertiary}`}>
                  {t("or")}
                </span>
                <div
                  className={`flex-1 h-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
                />
              </div>

              {fileUpload.previewUrl ? (
                <div
                  className={`relative rounded-xl overflow-hidden border ${isDark ? "border-gray-700" : "border-gray-200"} shadow-sm group`}
                >
                  <img
                    src={fileUpload.previewUrl}
                    alt="logo preview"
                    className="w-full h-36 object-cover"
                  />
                  {isUploading ? (
                    <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-2">
                      <CircularProgress
                        progress={fileUpload.progress}
                        size={48}
                      />
                      <span className="text-white text-[11px] font-medium">
                        {t("uploading")}
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <button
                        onClick={fileUpload.deleteFile}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-all shadow-lg"
                      >
                        <X className="w-3.5 h-3.5" />
                        {t("remove")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all select-none ${
                    dragOver
                      ? "border-violet-500 bg-violet-50 dark:bg-gray-700 scale-[1.01]"
                      : `${borderColor} hover:border-violet-400 dark:hover:border-violet-600 dark:hover:bg-gray-700`
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${dragOver ? "bg-violet-100 dark:bg-gray-700" : bgSecondary}`}
                    >
                      <Upload
                        className={`w-4 h-4 ${dragOver ? "text-violet-500" : textTertiary}`}
                      />
                    </div>
                    <p className={`text-sm font-medium ${textPrimary}`}>
                      {dragOver
                        ? t("drop_to_upload")
                        : t("drag_or_click_upload")}
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        )}

        {/* ── Tab: Boundary ─────────────────────────────────────────────── */}
        {activeTab === "boundary" && (
          <div className="p-5 space-y-3">
            <p className={`text-xs ${textTertiary}`}>
              Draw the DMO boundary polygon on the map. Drag the pin to set the
              center point.
            </p>

            <BoundaryMap
              center={center}
              boundary={boundary}
              onCenterChange={setCenter}
              onBoundaryChange={setBoundary}
            />

            {(center || boundary) && (
              <div
                className={`grid grid-cols-2 gap-2 text-[11px] font-mono ${textTertiary}`}
              >
                {center && (
                  <div
                    className={`px-2 py-1.5 rounded-lg ${bgSecondary} border ${borderColor}`}
                  >
                    <span className="font-sans font-semibold">Center</span>
                    <br />
                    {center.coordinates[1].toFixed(5)},{" "}
                    {center.coordinates[0].toFixed(5)}
                  </div>
                )}
                {boundary && (
                  <div
                    className={`px-2 py-1.5 rounded-lg ${bgSecondary} border ${borderColor}`}
                  >
                    <span className="font-sans font-semibold">Boundary</span>
                    <br />
                    {boundary.coordinates[0].length - 1} vertices
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Actions (always visible) ───────────────────────────────────── */}
        <div
          className={`flex justify-end gap-2 px-5 py-4 border-t ${borderColor}`}
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className={`px-4 py-2 rounded-lg border ${borderColor} text-sm font-medium ${textPrimary} transition`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-5 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {existingAuthority ? "Save Changes" : "Create DMO"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CreateDmoWizardModal;
