import { useState, useCallback } from "react";
import clsx from "clsx";
import { Plus, Settings, Clock, Info } from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { mockPromotions, mockPromotionSettings } from "@/constants/data";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { CreatePromotionWizard, DraggablePromotionCard } from "./components";
import { ModalWrapper } from "@/components/wrapper";
import { ReactSelect } from "@/components/form-fields";
import { useAppSelector } from "@/hooks/hooks";

export default function PromotionsMgmtPage() {
  const { t } = useTranslation("promotions");
  const {
    isDark,
    // language,
    bgPrimary,
    // bgSecondary,
    textPrimary,
    textSecondary,
    // textTertiary,
    borderColor,
  } = useThemeClasses();
  const [selectedWebsite, _setSelectedWebsite] = useState("visitnegev");
  const { associatedWebsite } = useAppSelector((state) => state.auth);
  const [externalApiId, setExternalApiId] = useState<string | undefined>("");
  const [promotions, setPromotions] = useState(mockPromotions);
  const [settings, setSettings] = useState<IPromotionSettings>(
    mockPromotionSettings[selectedWebsite],
  );
  const [selectedPlacement, setSelectedPlacement] = useState(
    settings.placements?.[0] ?? null,
  );
  const [showWizard, setShowWizard] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<
    IPromotion | undefined
  >();
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const filteredPromotions = promotions
    .filter((p) => {
      const matchesWebsite = p.websiteId === selectedWebsite;
      const matchesPlacement =
        !selectedPlacement || p.placement === selectedPlacement;

      return matchesWebsite && matchesPlacement;
    })
    .sort((a, b) => {
      // active first
      if (a.active !== b.active) {
        return a.active ? -1 : 1;
      }

      // then by order
      return a.order - b.order;
    });

  // const handleWebsiteChange = (websiteId: string) => {
  //   setSelectedWebsite(websiteId);
  //   setSettings(
  //     mockPromotionSettings[websiteId] || {
  //       websiteId,
  //       rotationType: "automatic",
  //       timeInterval: 5,
  //       placements: [],
  //     },
  //   );
  // };

  const handleMovePromotion = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const filtered = filteredPromotions;
      const dragPromotion = filtered[dragIndex];
      const hoverPromotion = filtered[hoverIndex];

      setPromotions((prev) => {
        return prev.map((p) => {
          if (p.id === dragPromotion.id) {
            return { ...p, order: hoverPromotion.order };
          }
          if (p.id === hoverPromotion.id) {
            return { ...p, order: dragPromotion.order };
          }
          return p;
        });
      });
    },
    [filteredPromotions],
  );

  const handleToggleActive = (id: string) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    );
  };

  const handleEdit = (promotion: IPromotion) => {
    setEditingPromotion(promotion);
    setShowWizard(true);
  };

  const handleDuplicate = (promotion: IPromotion) => {
    const newPromotion: IPromotion = {
      ...promotion,
      id: `promo-${Date.now()}`,
      title: {
        en: `${promotion.title.en} (Copy)`,
        he: `${promotion.title.he} (עותק)`,
        ar: `${promotion.title.ar} (نسخة)`,
      },
      order: filteredPromotions.length + 1,
      views: 0,
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPromotions((prev) => [...prev, newPromotion]);
  };

  const handleDelete = (id: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSavePromotion = (
    promotionData: Omit<
      IPromotion,
      "id" | "createdAt" | "updatedAt" | "createdBy" | "views" | "clicks"
    >,
  ) => {
    if (editingPromotion) {
      setPromotions((prev) =>
        prev.map((p) =>
          p.id === editingPromotion.id
            ? { ...p, ...promotionData, updatedAt: new Date() }
            : p,
        ),
      );
    } else {
      const newPromotion: IPromotion = {
        ...promotionData,
        id: `promo-${Date.now()}`,
        views: 0,
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "Current User",
      };
      setPromotions((prev) => [...prev, newPromotion]);
    }
    setShowWizard(false);
    setEditingPromotion(undefined);
  };

  // const handleBulkActivate = () => {
  //   setPromotions((prev) =>
  //     prev.map((p) =>
  //       selectedPromotions.includes(p.id) ? { ...p, active: true } : p,
  //     ),
  //   );
  //   setSelectedPromotions([]);
  // };

  // const handleBulkDeactivate = () => {
  //   setPromotions((prev) =>
  //     prev.map((p) =>
  //       selectedPromotions.includes(p.id) ? { ...p, active: false } : p,
  //     ),
  //   );
  //   setSelectedPromotions([]);
  // };

  // const handleBulkDelete = () => {
  //   if (
  //     confirm(
  //       `Are you sure you want to delete ${selectedPromotions.length} promotion(s)?`,
  //     )
  //   ) {
  //     setPromotions((prev) =>
  //       prev.filter((p) => !selectedPromotions.includes(p.id)),
  //     );
  //     setSelectedPromotions([]);
  //   }
  // };

  const handleUpdateSettings = (newSettings: Partial<IPromotionSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={clsx(
          "min-h-screen transition-colors flex flex-col",
          isDark ? "bg-gray-950" : "bg-gray-50",
        )}
      >
        <div
          className={`${bgPrimary} border-b ${borderColor} sticky top-0 z-10`}
        >
          <div className="px-8 py-6">
            {/* Title Bar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className={`text-3xl font-bold ${textPrimary}`}>
                  {t("promotions")}
                </h1>
                <p className={`text-sm ${textSecondary} mt-1`}>
                  {t("promotions_subtitle")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <ReactSelect
                  minWidth={180}
                  value={externalApiId}
                  items={associatedWebsite}
                  onChange={(value) => setExternalApiId(value)}
                  placeholder={t("select_website")}
                />
                {/* Website & Language Selector */}
                {/* <div className="flex items-center gap-4">
                  <div className="flex-1 max-w-xs">
                    <select
                      value={selectedWebsite}
                      onChange={(e) => handleWebsiteChange(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      <option value="visitnegev">{t("visit_negev")}</option>
                      <option value="beersheva">
                        {t("beer_sheva_tourism")}
                      </option>
                      <option value="arad">{t("arad_city")}</option>
                    </select>
                  </div>
                </div> */}

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={clsx(
                    `flex items-center gap-2 px-4 py-2 rounded-lg border ${borderColor} ${textPrimary} transition-colors`,
                    isDark ? "hover:bg-gray-800" : "hover:bg-gray-100",
                  )}
                >
                  <Settings className="w-4 h-4" />
                  {t("settings")}
                </button>

                <button
                  onClick={() => {
                    setEditingPromotion(undefined);
                    setShowWizard(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  {t("add_promotion")}
                </button>
              </div>
            </div>

            {showSettings && (
              <ModalWrapper
                onClose={() => setShowSettings(false)}
                maxWidth="max-w-lg"
                height=""
              >
                <div className="p-5 ">
                  <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>
                    {t("rotation_settings")}
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label
                        className={`block text-sm font-medium ${textPrimary} mb-2`}
                      >
                        {t("rotation_type")}
                      </label>

                      <select
                        value={settings.rotationType}
                        onChange={(e) =>
                          handleUpdateSettings({
                            rotationType: e.target.value as
                              | "automatic"
                              | "manual",
                          })
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="automatic">{t("automatic")}</option>
                        <option value="manual">{t("manual")}</option>
                      </select>
                    </div>

                    <div>
                      <label
                        className={`flex items-center gap-2 text-sm font-medium ${textPrimary} mb-2`}
                      >
                        <Clock className="w-4 h-4" />
                        {t("time_interval_seconds")}
                      </label>

                      <input
                        type="number"
                        value={settings.timeInterval}
                        onChange={(e) =>
                          handleUpdateSettings({
                            timeInterval: parseInt(e.target.value),
                          })
                        }
                        min="1"
                        max="60"
                        className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>

                  <div className="my-3">
                    <label
                      className={`flex items-center gap-2 text-sm font-medium ${textPrimary} mb-2`}
                    >
                      <Info className="w-4 h-4" />
                      {t("active_placements")}
                    </label>

                    <div
                      className={`p-3 rounded-lg border ${borderColor} ${bgPrimary}`}
                    >
                      <div className="space-y-1">
                        {settings.placements.map((placement, idx) => (
                          <div key={idx} className={`text-sm ${textSecondary}`}>
                            • {placement}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    className={clsx(
                      "mt-4 p-3 rounded-lg border",
                      isDark
                        ? "bg-blue-950/20 border-blue-800"
                        : "bg-blue-50 border-blue-200",
                    )}
                  >
                    <p
                      className={clsx(
                        "text-xs",
                        isDark ? "text-blue-100" : "text-blue-900",
                      )}
                    >
                      <strong>{t("note")}:</strong> {t("rotation_note_text")}
                    </p>
                  </div>
                </div>
              </ModalWrapper>
            )}

            <div className="flex border-b gap-4">
              {settings.placements.map((placement, idx) => {
                const active = selectedPlacement === placement;

                return (
                  <button
                    key={idx}
                    onClick={() =>
                      setSelectedPlacement((prev) =>
                        prev === placement ? "" : placement,
                      )
                    }
                    className={clsx(
                      "relative px-3 py-2 text-sm font-medium transition-all",

                      isDark ? "text-gray-300" : "text-gray-600",

                      active && (isDark ? "text-blue-400" : "text-blue-600"),
                    )}
                  >
                    {placement}

                    {/* active underline */}
                    <span
                      className={clsx(
                        "absolute left-0 -bottom-[1px] h-[2px] w-full transition-all",
                        active
                          ? isDark
                            ? "bg-blue-500"
                            : "bg-blue-600"
                          : "bg-transparent",
                      )}
                    />
                  </button>
                );
              })}
            </div>

            {selectedPromotions.length > 0 && (
              <div
                className={clsx(
                  "mt-4 flex items-center justify-between p-4 rounded-lg border",
                  isDark
                    ? "bg-blue-950/20 border-blue-800"
                    : "bg-blue-50 border-blue-200",
                )}
              >
                <span
                  className={clsx(
                    "text-sm font-medium",
                    isDark ? "text-blue-100" : "text-blue-900",
                  )}
                >
                  {t("bulk_selected_count", {
                    count: selectedPromotions.length,
                  })}
                </span>

                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    {t("activate")}
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                    {t("deactivate")}
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    {t("delete")}
                  </button>
                  <button
                    onClick={() => setSelectedPromotions([])}
                    className={clsx(
                      `px-3 py-1.5 text-sm border ${borderColor} ${textPrimary} rounded-lg transition-colors`,
                      isDark ? "hover:bg-gray-800" : "hover:bg-gray-100",
                    )}
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {filteredPromotions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <img
                src="https://images.unsplash.com/photo-1641381616914-bd619dc703c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbXB0eSUyMHN0YXRlJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc2ODE0MzgzN3ww&ixlib=rb-4.1.0&q=80&w=400"
                alt="No promotions"
                className="w-64 h-64 object-contain opacity-50 mb-6"
              />

              <h3 className={`text-xl font-semibold ${textPrimary} mb-2`}>
                {t("no_promotions_title")}
              </h3>

              <p className={`text-sm ${textSecondary} mb-6`}>
                {t("no_promotions_description")}
              </p>

              <button
                onClick={() => {
                  setEditingPromotion(undefined);
                  setShowWizard(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t("add_first_promotion")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {filteredPromotions.map((promotion, index) => (
                <DraggablePromotionCard
                  key={promotion.id}
                  promotion={promotion}
                  index={index}
                  onMove={handleMovePromotion}
                  onToggleActive={handleToggleActive}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {showWizard && (
          <CreatePromotionWizard
            onClose={() => {
              setShowWizard(false);
              setEditingPromotion(undefined);
            }}
            onSave={handleSavePromotion}
            existingPromotion={editingPromotion}
            websiteId={selectedWebsite}
            websiteName={
              selectedWebsite === "visitnegev"
                ? t("visit_negev")
                : selectedWebsite === "beersheva"
                  ? t("beer_sheva_tourism")
                  : t("arad_city")
            }
            availablePlacements={settings.placements}
          />
        )}
      </div>
    </DndProvider>
  );
}
