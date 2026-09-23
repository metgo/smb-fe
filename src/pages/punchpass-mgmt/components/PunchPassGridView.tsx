import clsx from "clsx";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, Loader, Ticket } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useDeletePunchPassMutation } from "@/store/api/punchPassApi";
import { ConfirmDialog, GridCard } from "@/components/shared";

interface PunchPassGridViewProps {
  punchPasses: IPunchPass[];
  isLoading: boolean;
  hasMore: boolean;
  refetch: () => void;
  fetchNextPage: () => void;
  selectedPunchPasses?: Set<string>;
  setSelectedPunchPasses?: (v: Set<string>) => void;
  onCardClick?: (punchPass: IPunchPass) => void;
  handleEditClick?: (punchPass: IPunchPass) => void;
}

const PunchPassGridView: React.FC<PunchPassGridViewProps> = ({
  punchPasses,
  isLoading,
  hasMore,
  refetch,
  fetchNextPage,
  selectedPunchPasses,
  setSelectedPunchPasses,
  onCardClick,
  handleEditClick,
}) => {
  const { t } = useTranslation("punch_pass");
  const { isDark } = useThemeClasses();

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useInfiniteScroll({
    ref: scrollRef,
    hasMore,
    isLoading,
    onLoadMore: fetchNextPage,
  });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deletePunchPass, { isLoading: isDeleting }] =
    useDeletePunchPassMutation();

  const handlePunchPassDelete = async (punchPassId: string) => {
    await deletePunchPass(punchPassId);
    toast.success(t("punch_pass_deleted_success"));
    refetch();
  };

  const toggleCheckBox = (itemId: string) => {
    const newSelected = new Set(selectedPunchPasses);
    if (newSelected.has(itemId)) newSelected.delete(itemId);
    else newSelected.add(itemId);
    if (setSelectedPunchPasses) setSelectedPunchPasses(newSelected);
  };

  return (
    <div
      className={`py-3 px-2 rounded-xl ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-white"}`}
    >
      <div
        ref={scrollRef}
        id="punch-pass-grid-scroll"
        className="overflow-x-auto max-h-[calc(100vh-200px)] overflow-y-auto"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {punchPasses?.map((punchPass) => (
            <GridCard
              key={punchPass._id}
              image={punchPass.image as unknown as string}
              imageAlt={punchPass.name}
              fallbackIcon={Ticket}
              fallbackGradient="from-teal-500 to-cyan-600"
              title={punchPass.name}
              status={(punchPass as any)?.status?.toLowerCase()}
              isChecked={selectedPunchPasses?.has(punchPass._id) ?? false}
              onCheckChange={
                selectedPunchPasses
                  ? () => toggleCheckBox(punchPass._id)
                  : undefined
              }
              onEdit={
                handleEditClick
                  ? (e) => {
                      e.stopPropagation();
                      handleEditClick(punchPass);
                    }
                  : undefined
              }
              onDelete={(e) => {
                e.stopPropagation();
                setIsConfirmOpen(true);
                setItemToDelete(punchPass._id);
              }}
              onClick={onCardClick ? () => onCardClick(punchPass) : undefined}
              footer={
                <div className="flex items-center justify-between">
                  <span
                    className={clsx(
                      "font-bold text-sm",
                      isDark ? "text-white" : "text-gray-900",
                    )}
                  >
                    ₪ {punchPass?.price?.sellingPrice ?? "-"}
                  </span>
                  {punchPass?.businessId?.name && (
                    <div
                      className={clsx(
                        "flex items-center gap-1 text-xs",
                        isDark ? "text-gray-400" : "text-gray-500",
                      )}
                    >
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-16">
                        {punchPass.businessId.name}
                      </span>
                    </div>
                  )}
                </div>
              }
            />
          ))}
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <Loader className="w-10 h-10 animate-spin text-teal-600" />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        title={t("delete_punch_pass")}
        message={t("delete_punch_pass_confirm")}
        confirmText="delete"
        loading={isDeleting}
        variant="danger"
        onCancel={() => {
          setIsConfirmOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={() => {
          if (!itemToDelete) return;
          handlePunchPassDelete(itemToDelete);
          setIsConfirmOpen(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
};

export default PunchPassGridView;
