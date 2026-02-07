import clsx from "clsx";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Upload, X } from "lucide-react";

import { formatDate } from "@/helpers/formatter";
import { ModalWrapper } from "@/components/wrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useSingleImageUpload } from "@/hooks/useSingleImageUpload";
import { ConfirmDialog, ImageWithFallback } from "@/components/shared";
import {
  useCreateTicketMutation,
  useUpdateTicketMutation,
} from "@/store/api/eventMutationApi";

interface CreateTicketWizardProps {
  opMode: TTicketOpMode;
  setIsOpen: (v: boolean) => void;
  setEditData: (v: any) => void;
  editData: ITicketPayload;
  eventId: string | null;
  refetch?: () => void;
  eventDays: EventDay[];
  ticketDateTime: ITicketDateTime[];
  setTicketDateTime: React.Dispatch<React.SetStateAction<ITicketDateTime[]>>;
}

const modelTitle = (mode: TTicketOpMode, t: (key: string) => string) => {
  switch (mode) {
    case "CREATE":
      return t("create_ticket");
    case "UPDATE":
      return t("edit_ticket");
    case "DUPLICATE":
      return t("duplicate_ticket");
    default:
      return "";
  }
};

const CreateTicketWizard = ({
  setIsOpen,
  setEditData,
  editData,
  eventId,
  refetch,
  opMode,
  eventDays,
  ticketDateTime,
  setTicketDateTime,
}: CreateTicketWizardProps) => {
  const { t } = useTranslation("events");
  const {
    textPrimary,
    textSecondary,
    inputClasses,
    textTertiary,
    rowDir,
    isDark,
  } = useThemeClasses();

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [isDelete, setIsDelete] = useState(false);

  // ─── ERROR STATES ───────────────────────────────────────────────
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    ticketDays: string[];
    markedPrice?: string;
    sellingPrice?: string;
  }>({ ticketDays: [] });

  const isPaidOrVip = ["paid", "vip"].includes(
    editData?.type?.toLowerCase() || "",
  );

  const {
    image,
    handleImageSelect,
    uploadImage,
    confirmDelete,
    deleteTarget,
    setDeleteTarget,
    isImageDeleting,
    handleDeleteImage,
  } = useSingleImageUpload({
    initialImage: isDelete ? undefined : editData?.imageUrl,
    onChange: () => {},
  });
  console.log("🚀 ~ CreateTicketWizard ~ image:", image);

  const [createTicket, { isLoading: isSaving }] = useCreateTicketMutation();
  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();

  // ─── VALIDATION ─────────────────────────────────────────────────
  const validateTicket = (): boolean => {
    const newErrors: typeof errors = { ticketDays: [] };
    let isValid = true;
    let firstInvalidField: string | null = null;

    // Name
    if (!editData.name?.trim()) {
      newErrors.name = t("ticket_name_required") || "Ticket name is required";
      isValid = false;
      firstInvalidField = firstInvalidField ?? "name";
    }

    // Description
    if (!editData.description?.trim()) {
      newErrors.description =
        t("description_required") || "Ticket description is required";
      isValid = false;
      firstInvalidField = firstInvalidField ?? "description";
    }

    // Ticket days
    ticketDateTime.forEach((day, index) => {
      let dayError = "";
      if (!day.date?.trim()) {
        dayError = t("date_required") || "Date is required";
        isValid = false;
      }
      if (!day.startTime) {
        dayError =
          dayError || t("start_time_required") || "Start time required";
        isValid = false;
      }
      if (!day.endTime) {
        dayError = dayError || t("end_time_required") || "End time required";
        isValid = false;
      }
      if (day.startTime && day.endTime && day.startTime >= day.endTime) {
        dayError =
          dayError || t("end_after_start") || "End time must be after start";
        isValid = false;
      }
      if (dayError) {
        newErrors.ticketDays[index] = dayError;
        firstInvalidField = firstInvalidField ?? `day-${index}`;
      }
    });

    // Prices - only when paid or VIP
    if (isPaidOrVip) {
      if (!editData.price?.markedPrice || editData.price.markedPrice <= 0) {
        newErrors.markedPrice =
          t("marked_price_required") || "Marked price is required";
        isValid = false;
        firstInvalidField = firstInvalidField ?? "markedPrice";
      }
      if (!editData.price?.sellingPrice || editData.price.sellingPrice <= 0) {
        newErrors.sellingPrice =
          t("selling_price_required") || "Selling price is required";
        isValid = false;
        firstInvalidField = firstInvalidField ?? "sellingPrice";
      }
    }

    setErrors(newErrors);

    // Scroll to first error field (after DOM has chance to update)
    if (!isValid && firstInvalidField) {
      setTimeout(() => {
        if (firstInvalidField !== null) {
          const targetEl = sectionRefs.current[firstInvalidField];
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

            // Try to focus the first input/select/textarea inside
            const focusable = targetEl.querySelector(
              "input:not([type=hidden]), textarea, select",
            ) as HTMLElement | null;
            focusable?.focus();
          }
        }
      }, 80); // small delay helps with conditional rendering / re-renders
    }

    return isValid;
  };

  const clearError = (field: keyof typeof errors | `day-${number}`) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (field === "name") next.name = undefined;
      else if (field === "description") next.description = undefined;
      else if (field === "markedPrice") next.markedPrice = undefined;
      else if (field === "sellingPrice") next.sellingPrice = undefined;
      else if (field.startsWith("day-")) {
        const idx = Number(field.split("-")[1]);
        next.ticketDays[idx] = "";
      }
      return next;
    });
  };

  const saveTicket = async () => {
    if (!validateTicket()) return;
    if (!eventId) {
      toast.error("Event ID is missing");
      return;
    }

    const uploadImageUrl = await uploadImage();

    const payload: ITicketPayload = {
      eventId,
      name: editData.name.trim(),
      description: editData.description?.trim() || "",
      price: {
        markedPrice: editData.price?.markedPrice || 0,
        sellingPrice: editData.price?.sellingPrice || 0,
        discountPercent: 0,
        discountAmount: 0,
      },
      quantity: {
        initial: editData.quantity?.initial || 0,
        sold: 0,
        remaining: editData.quantity?.initial || 0,
        isUnlimited: editData.quantity?.isUnlimited || false,
        perUserLimit: editData.quantity?.perUserLimit || 0,
      },
      dayDescription: ticketDateTime.map((item) => ({
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
      })),
      images: [{ image: uploadImageUrl ?? image?.gcsURL }],
      status: "active",
      type: editData.type.toUpperCase(),
    };

    try {
      const res =
        editData._id && opMode !== "DUPLICATE"
          ? await updateTicket({
              body: payload,
              ticketId: editData._id,
            }).unwrap()
          : await createTicket(payload).unwrap();

      toast.success(
        res?.message ||
          t("ticket_saved_successfully") ||
          "Ticket saved successfully",
      );
      if (refetch) refetch();
      setIsOpen(false);
      setEditData(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save ticket");
    }
  };

  const addTicketDay = () => {
    setTicketDateTime((prev) => [
      ...prev,
      {
        _id: ticketDateTime.length + 1,
        date: eventDays[0]?.date || "",
        startTime: eventDays[0]?.startTime || "09:00",
        endTime: eventDays[0]?.endTime || "17:00",
      },
    ]);
  };

  const removeEventDay = (id: string | number) => {
    setTicketDateTime((prev) => prev.filter((day) => day._id !== id));
  };

  const updateTicketDay = (
    index: number,
    field: keyof ITicketDateTime,
    value: string,
  ) => {
    setTicketDateTime((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    clearError(`day-${index}`);
  };

  function handleClose() {
    setIsOpen(false);
    setEditData(null);
  }

  return (
    <ModalWrapper
      onClose={handleClose}
      height="h-[88vh]"
      maxWidth="max-w-3xl"
      showSpinner={isSaving || isUpdating || image?.status === "uploading"}
    >
      <div className="p-4 space-y-4 relative">
        <h3 className={`text-xl ${textPrimary}`}>{modelTitle(opMode, t)}</h3>

        <section
          className={clsx(
            "px-3 py-5 space-y-6 max-h-[70vh] overflow-y-auto rounded-lg border",
            isDark
              ? "border-gray-700 bg-gray-800/50"
              : "border-gray-200 bg-gray-50",
          )}
        >
          {/* === Ticket Name === */}
          <div
            ref={(el) => {
              sectionRefs.current["name"] = el;
            }}
          >
            <label className={`block text-sm mb-2 ${textSecondary}`}>
              {t("ticket_name")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editData?.name || ""}
              onChange={(e) => {
                setEditData((prev: ITicketPayload) => ({
                  ...prev,
                  name: e.target.value,
                }));
                clearError("name");
              }}
              placeholder={t("general_admission")}
              className={clsx(
                "w-full px-4 py-2.5 rounded-lg border transition-colors",
                inputClasses,
                errors.name && "field-error",
              )}
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          {/* === Description === */}
          <div
            ref={(el) => {
              sectionRefs.current["description"] = el;
            }}
          >
            <label className={`block text-sm mb-2 ${textSecondary}`}>
              {t("description")} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={editData?.description || ""}
              onChange={(e) =>
                setEditData((prev: ITicketPayload) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={
                t("enter_ticket_description") || "Enter ticket description..."
              }
              rows={3}
              className={clsx(
                "w-full px-4 py-2.5 rounded-lg border transition-colors",
                inputClasses,
                errors.description && "field-error",
              )}
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {errors.description}
              </p>
            )}
          </div>

          {/* === Ticket Days === */}
          <section>
            <label className={`block text-sm mb-2 ${textSecondary}`}>
              {t("ticket_days")}
            </label>
            <div className="space-y-4 mt-2">
              {ticketDateTime?.map((day, index) => (
                <div
                  key={day._id}
                  ref={(el) => {
                    if (el) sectionRefs.current[`day-${index}`] = el;
                  }}
                  className="space-y-2"
                >
                  <div
                    className={clsx(
                      "grid grid-cols-12 gap-2 items-center",
                      rowDir,
                    )}
                  >
                    <div className="col-span-5">
                      <select
                        value={day.date}
                        onChange={(e) =>
                          updateTicketDay(index, "date", e.target.value)
                        }
                        className={clsx(
                          "w-full px-3 py-2 rounded-lg border transition-colors",
                          inputClasses,
                          errors.ticketDays[index] &&
                            "border-red-500 focus:border-red-500",
                        )}
                      >
                        <option value="">{t("select_date")}</option>
                        {eventDays.map((d) => (
                          <option key={d.id} value={d.date}>
                            {formatDate(d.date, "en")}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) =>
                          updateTicketDay(index, "startTime", e.target.value)
                        }
                        className={clsx(
                          "w-full px-3 py-2 rounded-lg border transition-colors",
                          inputClasses,
                          errors.ticketDays[index] &&
                            "border-red-500 focus:border-red-500",
                        )}
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) =>
                          updateTicketDay(index, "endTime", e.target.value)
                        }
                        className={clsx(
                          "w-full px-3 py-2 rounded-lg border transition-colors",
                          inputClasses,
                          errors.ticketDays[index] &&
                            "border-red-500 focus:border-red-500",
                        )}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeEventDay(day?._id || "")}
                      className="col-span-1 p-2 text-red-500 hover:text-red-600 bg-red-100 dark:bg-red-900/30 rounded-md flex items-center justify-center"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {errors?.ticketDays[index] && (
                    <p className="text-sm text-red-600 dark:text-red-400 pl-1">
                      {errors.ticketDays[index]}
                    </p>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addTicketDay}
                className="border border-dashed border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-md px-4 py-2.5 flex items-center justify-center w-full transition-colors"
              >
                <Plus size={18} className="mr-2" />
                {t("add_more_days")}
              </button>
            </div>
          </section>

          {/* === Ticket Type === */}
          <div>
            <label className={`block text-sm mb-2 ${textSecondary}`}>
              {t("ticket_type")}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["free", "paid", "vip"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setEditData((prev: ITicketPayload) => ({
                      ...prev,
                      type,
                      ...(type === "free"
                        ? {
                            price: {
                              ...prev.price,
                              markedPrice: 0,
                              sellingPrice: 0,
                            },
                          }
                        : {}),
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      markedPrice: undefined,
                      sellingPrice: undefined,
                    }));
                  }}
                  className={clsx(
                    "px-4 py-2.5 rounded-lg border capitalize transition-colors",
                    editData?.type?.toLowerCase() === type
                      ? "border-teal-500 bg-teal-500/10 text-teal-500 font-medium"
                      : isDark
                        ? "border-gray-700 hover:bg-gray-800 text-white/80"
                        : "border-gray-300 hover:bg-gray-50",
                  )}
                >
                  {t(type)}
                </button>
              ))}
            </div>
          </div>

          {/* === Prices === */}
          {isPaidOrVip && (
            <div className="grid grid-cols-2 gap-4">
              <div
                ref={(el) => {
                  sectionRefs.current["markedPrice"] = el;
                }}
              >
                <label className={`block text-sm mb-2 ${textSecondary}`}>
                  {t("marked_price")} (₪){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={editData?.price?.markedPrice || ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setEditData((prev: ITicketPayload) => ({
                      ...prev,
                      price: { ...prev.price, markedPrice: val },
                    }));
                    clearError("markedPrice");
                  }}
                  className={clsx(
                    "w-full px-4 py-2.5 rounded-lg border transition-colors",
                    inputClasses,
                    errors.markedPrice && "field-error",
                  )}
                />
                {errors.markedPrice && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {errors.markedPrice}
                  </p>
                )}
              </div>

              <div
                ref={(el) => {
                  sectionRefs.current["sellingPrice"] = el;
                }}
              >
                <label className={`block text-sm mb-2 ${textSecondary}`}>
                  {t("selling_price")} (₪){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={editData?.price?.sellingPrice || ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setEditData((prev: ITicketPayload) => ({
                      ...prev,
                      price: { ...prev.price, sellingPrice: val },
                    }));
                    clearError("sellingPrice");
                  }}
                  className={clsx(
                    "w-full px-4 py-2.5 rounded-lg border transition-colors",
                    inputClasses,
                    errors.sellingPrice && "field-error",
                  )}
                />
                {errors.sellingPrice && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {errors.sellingPrice}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                {t("quantity")}
              </label>
              <input
                type="number"
                min={1}
                value={editData?.quantity?.initial ?? ""}
                onChange={(e) =>
                  setEditData((prev: any) => ({
                    ...prev,
                    quantity: {
                      ...prev.quantity,
                      initial: parseInt(e.target.value) || 0,
                    },
                  }))
                }
                className={`w-full px-4 py-2.5 rounded-lg border ${inputClasses}`}
              />
            </div>
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                {t("per_user_limit")}
              </label>
              <input
                type="number"
                min={1}
                value={editData?.quantity?.perUserLimit ?? ""}
                onChange={(e) =>
                  setEditData((prev: any) => ({
                    ...prev,
                    quantity: {
                      ...prev.quantity,
                      perUserLimit: parseInt(e.target.value) || 0,
                    },
                  }))
                }
                className={`w-full px-4 py-2.5 rounded-lg border ${inputClasses}`}
              />
            </div>
          </div>

          {/* === Ticket Image === */}
          <div>
            <div className="flex items-center justify-between">
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                {t("ticket_image")}
              </label>
              {image?.progress !== undefined &&
                image.progress > 0 &&
                image.status === "uploading" && (
                  <div className="flex items-center gap-2 w-32">
                    <div className="w-full bg-gray-200 rounded h-2">
                      <div
                        className="bg-teal-600 h-2 rounded transition-all"
                        style={{ width: `${image.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {image.progress}%
                    </span>
                  </div>
                )}
            </div>

            <div
              className={clsx(
                "border-2 border-dashed rounded-lg p-4",
                isDark
                  ? "border-gray-700 bg-gray-800/30"
                  : "border-gray-300 bg-gray-50",
              )}
            >
              {image?.previewUrl ? (
                <div className="relative">
                  <ImageWithFallback
                    src={image.previewUrl}
                    alt="Ticket preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteImage(image, opMode);
                      setIsDelete(true);
                    }}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload
                    className={`w-10 h-10 mx-auto mb-2 ${textTertiary}`}
                  />
                  <p className={`text-sm ${textSecondary} mb-2`}>
                    {t("click_to_upload_or_drag")}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageSelect(file);
                    }}
                    className="hidden"
                    id="ticket-image-upload"
                  />
                  <label
                    htmlFor="ticket-image-upload"
                    className="inline-block px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg cursor-pointer"
                  >
                    {t("browse_files")}
                  </label>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => {
              setIsOpen(false);
              setEditData(null);
            }}
            className={clsx(
              "px-5 py-2.5 rounded-lg border transition-colors",
              isDark
                ? "border-gray-700 hover:bg-gray-800"
                : "border-gray-300 hover:bg-gray-100",
              textSecondary,
            )}
          >
            {t("cancel")}
          </button>

          <button
            onClick={saveTicket}
            disabled={isSaving || isUpdating || image?.status === "uploading"}
            className={clsx(
              "px-6 py-2.5 rounded-lg text-white transition-colors min-w-30",
              isSaving || isUpdating || image?.status === "uploading"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700 cursor-pointer",
            )}
          >
            {isSaving || isUpdating || image?.status === "uploading"
              ? "Saving..."
              : t("save_ticket")}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="delete_image"
        message="delete_image_confirm"
        confirmText="delete"
        loading={isImageDeleting}
        variant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </ModalWrapper>
  );
};

export default CreateTicketWizard;
