import clsx from "clsx";
import { toast } from "sonner";
import { DndProvider } from "react-dnd";
import { Plus, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";

import { useAppSelector } from "@/hooks/hooks";
import { PublishButton } from "@/components/btns";
import { ReactSelect } from "@/components/form-fields";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useGetPromotionsByExtApiIdQuery,
  useCreatePromotionGroupMutation,
  useDeletePromotionMutation,
  useDuplicatePromotionMutation,
  useTogglePromotionStatusMutation,
  useGetPromotionGroupQuery,
} from "@/store/api/promotionsApi";
import {
  CreatePromotionWizard,
  DraggablePromotionCard,
  PlacementSettingsDrawer,
  PromoEmptyState,
} from "./components";
import { ConfirmDialog, Spinner } from "@/components/shared";

const placements = ["home_page_hero", "secondary_banner", "footer_spotlight"];

const defaultPlacementConfig = (): TPlacementConfig => ({
  rotationType: "automatic",
  timeInterval: 5,
});

const buildDefaultPlacementSettings = (): Record<string, TPlacementConfig> =>
  Object.fromEntries(placements.map((p) => [p, defaultPlacementConfig()]));

export default function PromotionsMgmtPage() {
  const { t } = useTranslation("promotions");
  const { t: tToast } = useTranslation("toast");
  const { isDark, bgPrimary, textPrimary, textSecondary, borderColor } =
    useThemeClasses();
  const { associatedWebsite } = useAppSelector((state) => state.auth);

  const [externalApiId, setExternalApiId] = useState<string | undefined>("");
  const [deletePromoId, setDeletePromoId] = useState<string>("");
  const [orderedPromotions, setOrderedPromotions] = useState<IPromotionsRes[]>(
    [],
  );
  const [placementSettings, setPlacementSettings] = useState<
    Record<string, TPlacementConfig>
  >(buildDefaultPlacementSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isLoading } = useGetPromotionsByExtApiIdQuery(
    externalApiId ? externalApiId : skipToken,
  );
  const { data: groupConfig, isLoading: isCofigLoading } =
    useGetPromotionGroupQuery(externalApiId ? externalApiId : skipToken);

  const [createPromotionGroup, { isLoading: isPublishing }] =
    useCreatePromotionGroupMutation();
  const [deletePromotion, { isLoading: isDeleting }] =
    useDeletePromotionMutation();
  const [duplicatePromotion] = useDuplicatePromotionMutation();
  const [togglePromotion] = useTogglePromotionStatusMutation();

  const isInitialized = useRef(false);

  // Reset initialization flag when the selected website changes
  useEffect(() => {
    isInitialized.current = false;
  }, [externalApiId]);

  // Sync ordered list, applying groupConfig order on first load
  useEffect(() => {
    if (!data) return;

    if (!isInitialized.current) {
      if (isCofigLoading) return; // wait for groupConfig before sorting
      isInitialized.current = true;

      if (groupConfig) {
        const orderMap = new Map<string, number>();
        groupConfig.placementGroup.forEach(({ promotions }) => {
          promotions.forEach(({ promoId, order }) =>
            orderMap.set(promoId, order),
          );
        });
        setOrderedPromotions(
          [...data].sort(
            (a, b) =>
              (orderMap.get(a._id) ?? Infinity) -
              (orderMap.get(b._id) ?? Infinity),
          ),
        );
      } else {
        setOrderedPromotions(data);
      }
      return;
    }

    // Subsequent refreshes (toggle/delete/duplicate): preserve drag order
    setOrderedPromotions((prev) => {
      const dataMap = new Map(data.map((d) => [d._id, d]));
      const dataIds = new Set(data.map((d) => d._id));
      const updated = prev
        .filter((p) => dataIds.has(p._id))
        .map((p) => dataMap.get(p._id)!);
      const newItems = data.filter((d) => !prev.some((p) => p._id === d._id));
      return [...updated, ...newItems];
    });
  }, [data, groupConfig, isCofigLoading]);

  // Hydrate placement settings from the saved group config
  useEffect(() => {
    if (!groupConfig) return;
    const mapped = Object.fromEntries(
      groupConfig.placementGroup.map(
        ({ placement, rotationType, timeInterval }) => [
          placement,
          { rotationType: rotationType as TRotationType, timeInterval },
        ],
      ),
    );
    setPlacementSettings((prev) => ({ ...prev, ...mapped }));
  }, [groupConfig]);

  const [selectedPlacement, setSelectedPlacement] = useState(
    placements[0] ?? null,
  );
  const [showWizard, setShowWizard] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<
    IPromotionsRes | undefined
  >();
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);

  const filteredPromotions = orderedPromotions
    .filter((p) => !selectedPlacement || p.placement === selectedPlacement)
    .sort((a, b) => {
      // active items first; preserve drag order within each group
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return 0;
    });

  const handleMovePromotion = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setOrderedPromotions((prev) => {
        const next = [...prev];
        const dragItem = filteredPromotions[dragIndex];
        const hoverItem = filteredPromotions[hoverIndex];
        const dragPos = next.findIndex((p) => p._id === dragItem._id);
        const hoverPos = next.findIndex((p) => p._id === hoverItem._id);
        next.splice(dragPos, 1);
        next.splice(hoverPos, 0, dragItem);
        return next;
      });
    },
    [filteredPromotions],
  );

  const handleToggleActive = async (promotionId: string, status: boolean) => {
    const res = await togglePromotion({ promotionId, status });
    if (res.data) {
      toast.success(tToast("promotion_status_update_success"));
    } else {
      toast.error(tToast("promotion_status_update_failed"));
    }
  };

  const handleEdit = (promotion: IPromotionsRes) => {
    setEditingPromotion(promotion);
    setShowWizard(true);
  };

  const handleDelete = async (id: string) => {
    const res = await deletePromotion(id);
    if (res.data) {
      toast.success(tToast("promotion_deleted_success"));
    } else {
      toast.error(tToast("promotion_delete_failed"));
    }
  };

  const handleDuplicate = async (promotion: IPromotionsRes) => {
    const res = await duplicatePromotion(promotion._id);
    if (res.data) {
      toast.success(tToast("promotion_created_success"));
    } else {
      toast.error(tToast("promotion_create_failed"));
    }
  };

  /** Build IPromotionGroupFormData from current ordered state + per-placement settings. */
  const buildGroupPayload = (): IPromotionGroupFormData => ({
    externalApiId: externalApiId!,
    placementGroup: placements.map((placement) => {
      const cfg = placementSettings[placement] ?? defaultPlacementConfig();
      return {
        placement,
        rotationType: cfg.rotationType,
        timeInterval: cfg.timeInterval,
        promotions: orderedPromotions
          .filter((p) => p.placement === placement && p.isActive)
          .map((p, idx) => ({ promoId: p._id, order: idx + 1 })),
      };
    }),
  });

  const handlePublish = async () => {
    if (!externalApiId) return;
    const payload = buildGroupPayload();
    const filteredPlacementGroup = payload.placementGroup.filter(
      (item) => item.promotions.length > 0,
    );
    const res = await createPromotionGroup({
      externalApiId,
      placementGroup: filteredPlacementGroup,
    });
    if (res.data) {
      toast.success(tToast("promotion_group_publish_success"));
    } else {
      toast.error(tToast("promotion_group_publish_failed"));
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={clsx(
          "max-h-screen transition-colors flex flex-col relative gap-4",
          isDark ? "bg-gray-950" : "bg-gray-50",
        )}
      >
        <Spinner isLoading={isCofigLoading || isLoading || isPublishing} />

        <div
          className={`${bgPrimary} border-b ${borderColor} sticky top-0 z-10 rounded-xl p-4`}
        >
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
              <button
                onClick={() => {
                  setShowWizard(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t("add_promotion")}
              </button>
            </div>
          </div>

          <div className="flex gap-4 items-center justify-between">
            <div className="flex justify-start">
              {placements.map((placement, idx) => {
                const active = selectedPlacement === placement;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedPlacement((prev) =>
                        prev === placement ? "" : placement,
                      );
                      setSettingsOpen(false);
                    }}
                    className={clsx(
                      "relative px-3 py-2 text-sm font-medium transition-all",
                      isDark ? "text-gray-300" : "text-gray-600",
                      active && (isDark ? "text-green-400" : "text-green-600"),
                    )}
                  >
                    {t(placement)}

                    <span
                      className={clsx(
                        "absolute left-0 -bottom-px h-0.5 w-full transition-all",
                        active
                          ? isDark
                            ? "bg-green-500"
                            : "bg-green-600"
                          : "bg-transparent",
                      )}
                    />
                  </button>
                );
              })}
            </div>

            <div>
              <PublishButton isLoading={isPublishing} onClick={handlePublish} />
            </div>
          </div>

          {selectedPromotions.length > 0 && (
            <div
              className={clsx(
                "mt-4 flex items-center justify-between rounded-lg border",
                isDark
                  ? "bg-green-950/20 border-green-800"
                  : "bg-green-50 border-green-200",
              )}
            >
              <span
                className={clsx(
                  "text-sm font-medium",
                  isDark ? "text-green-100" : "text-green-900",
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

        <div
          className={clsx(
            "flex-1 overflow-y-auto p-3  border rounded-xl",
            borderColor,
          )}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredPromotions.length === 0 ? (
            <PromoEmptyState
              setEditingPromotion={setEditingPromotion}
              setShowWizard={setShowWizard}
            />
          ) : (
            <AnimatePresence>
              <div
                className={clsx(
                  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3",
                )}
              >
                {filteredPromotions.map((promotion, index) => (
                  <DraggablePromotionCard
                    t={t}
                    index={index}
                    key={promotion._id}
                    promotion={promotion}
                    onMove={handleMovePromotion}
                    onToggleActive={handleToggleActive}
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                    setConfirmOpen={setConfirmOpen}
                    setDeletePromoId={setDeletePromoId}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {showWizard && (
          <CreatePromotionWizard
            onClose={() => {
              setShowWizard(false);
              setEditingPromotion(undefined);
            }}
            existingPromotion={editingPromotion}
          />
        )}

        {/* Fixed FAB — bottom-right */}
        {selectedPlacement && (
          <button
            onClick={() => setSettingsOpen((prev) => !prev)}
            title={t("placement_settings")}
            className={clsx(
              "fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg transition-colors",
              isDark
                ? "bg-gray-800 border border-gray-700 text-green-400 hover:bg-gray-700"
                : "bg-white border border-gray-200 text-green-600 hover:bg-gray-50",
            )}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        )}

        {/* Compact bottom drawer for active placement */}
        {settingsOpen && (
          <PlacementSettingsDrawer
            selectedPlacement={selectedPlacement}
            settingsOpen={settingsOpen}
            setSettingsOpen={setSettingsOpen}
            placementSettings={placementSettings}
            setPlacementSettings={setPlacementSettings}
            defaultPlacementConfig={defaultPlacementConfig}
          />
        )}

        <ConfirmDialog
          open={confirmOpen}
          title={t("delete_promotion")}
          message={t("delete_promotion_confirm")}
          confirmText="delete"
          variant="danger"
          loading={isDeleting}
          onCancel={() => {
            setConfirmOpen(false);
            setDeletePromoId("");
          }}
          onConfirm={() => {
            handleDelete(deletePromoId);
            setConfirmOpen(false);
          }}
        />
      </div>
    </DndProvider>
  );
}
