import clsx from "clsx";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Upload, X } from "lucide-react";

import { formatDate } from "@/helpers/formatter";
import { ModalWrapper } from "@/components/wrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useFilesUpload } from "@/hooks/useFilesUpload";
import { ConfirmDialog, ImageWithFallback } from "@/components/shared";
import { FormFieldWrapper } from "@/components/form-fields";
import { IOpMode } from "@/enums/operation.types";
import {
  useCreateTicketMutation,
  useUpdateTicketMutation,
} from "@/store/api/eventMutationApi";

interface TicketModalProps {
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

type TicketErrors = {
  name?: string;
  description?: string;
  ticketDays: string[];
  markedPrice?: string;
  sellingPrice?: string;
};

const MODAL_TITLES: Record<TTicketOpMode, string> = {
  CREATE: "create_ticket",
  UPDATE: "edit_ticket",
  DUPLICATE: "duplicate_ticket",
};

const TicketModal: React.FC<TicketModalProps> = ({
  setIsOpen,
  setEditData,
  editData,
  eventId,
  refetch,
  opMode,
  eventDays,
  ticketDateTime,
  setTicketDateTime,
}) => {
  const { t } = useTranslation("events");
  const { t: tc } = useTranslation("common");
  const {
    textPrimary,
    textSecondary,
    inputClasses,
    textTertiary,
    rowDir,
    isDark,
  } = useThemeClasses();

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [errors, setErrors] = useState<TicketErrors>({ ticketDays: [] });

  const isPaidOrVip = ["paid", "vip"].includes(
    editData?.type?.toLowerCase() ?? "",
  );

  const {
    images,
    handleImageUpload,
    confirmDelete,
    deleteTarget,
    setDeleteTarget,
    isImageDeleting,
    handleDeleteImage,
  } = useFilesUpload({
    initialImages: editData?.imageUrl ? [{ image: editData.imageUrl }] : [],
  });

  const [createTicket, { isLoading: isSaving }] = useCreateTicketMutation();
  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();

  // ─── Helpers ────────────────────────────────────────────────────────
  const computeDiscounts = (markedPrice: number, sellingPrice: number) => {
    if (markedPrice > 0 && sellingPrice >= 0 && sellingPrice <= markedPrice) {
      const discountAmount = markedPrice - sellingPrice;
      const discountPercent = Number(
        ((discountAmount / markedPrice) * 100).toFixed(2),
      );
      return { discountAmount, discountPercent };
    }
    return { discountAmount: 0, discountPercent: 0 };
  };

  const clearError = (field: keyof TicketErrors | `day-${number}`) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (field === "name") next.name = undefined;
      else if (field === "description") next.description = undefined;
      else if (field === "markedPrice") next.markedPrice = undefined;
      else if (field === "sellingPrice") next.sellingPrice = undefined;
      else if (field.startsWith("day-")) {
        const idx = Number(field.split("-")[1]);
        const days = [...next.ticketDays];
        days[idx] = "";
        next.ticketDays = days;
      }
      return next;
    });
  };

  // ─── Validation ─────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: TicketErrors = { ticketDays: [] };
    let isValid = true;
    let firstInvalidKey: string | null = null;

    if (!editData?.name?.trim()) {
      newErrors.name = t("ticket_name_required");
      isValid = false;
      firstInvalidKey ??= "name";
    }

    if (!editData?.description?.trim()) {
      newErrors.description = t("description_required");
      isValid = false;
      firstInvalidKey ??= "description";
    }

    ticketDateTime.forEach((day, i) => {
      let msg = "";
      if (!day.date?.trim()) msg = t("date_required");
      else if (!day.startTime) msg = t("start_time_required");
      else if (!day.endTime) msg = t("end_time_required");
      else if (day.startTime >= day.endTime) msg = t("end_after_start");

      if (msg) {
        newErrors.ticketDays[i] = msg;
        isValid = false;
        firstInvalidKey ??= `day-${i}`;
      }
    });

    if (isPaidOrVip) {
      if (!editData?.price?.markedPrice || editData.price.markedPrice <= 0) {
        newErrors.markedPrice = t("marked_price_required");
        isValid = false;
        firstInvalidKey ??= "markedPrice";
      }
      if (!editData?.price?.sellingPrice || editData.price.sellingPrice <= 0) {
        newErrors.sellingPrice = t("selling_price_required");
        isValid = false;
        firstInvalidKey ??= "sellingPrice";
      }
    }

    setErrors(newErrors);

    if (!isValid && firstInvalidKey) {
      setTimeout(() => {
        const el = sectionRefs.current[firstInvalidKey!];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          const focusable = el.querySelector(
            "input:not([type=hidden]), textarea, select",
          ) as HTMLElement | null;
          focusable?.focus();
        }
      }, 80);
    }

    return isValid;
  };

  // ─── Save ───────────────────────────────────────────────────────────
  const saveTicket = async () => {
    if (!validate()) return;
    if (!eventId) {
      toast.error(t("event_id_missing"));
      return;
    }

    const payload: ITicketPayload = {
      eventId,
      name: editData.name.trim(),
      description: editData.description?.trim() ?? "",
      price: {
        markedPrice: editData.price?.markedPrice ?? 0,
        sellingPrice: editData.price?.sellingPrice ?? 0,
        discountPercent: editData.price?.discountPercent ?? 0,
        discountAmount: editData.price?.discountAmount ?? 0,
      },
      quantity: {
        initial: editData.quantity?.initial ?? 0,
        sold: 0,
        remaining: editData.quantity?.initial ?? 0,
        isUnlimited: editData.quantity?.isUnlimited ?? false,
        perUserLimit: editData.quantity?.perUserLimit ?? 0,
      },
      dayDescription: ticketDateTime.map(({ date, startTime, endTime }) => ({
        date,
        startTime,
        endTime,
      })),
      images: [{ image: images[0]?.gcsURL ?? "" }],
      status: editData.status,
      type: editData.type.toUpperCase(),
    };

    try {
      const res =
        editData._id && opMode !== IOpMode.DUPLICATE
          ? await updateTicket({
              body: payload,
              ticketId: editData._id,
            }).unwrap()
          : await createTicket(payload).unwrap();

      toast.success(res?.message || t("ticket_saved_successfully"));
      refetch?.();
      setIsOpen(false);
      setEditData(null);
    } catch (err: any) {
      toast.error(err?.data?.message || t("ticket_save_failed"));
    }
  };

  // ─── Ticket day helpers ──────────────────────────────────────────────
  const addTicketDay = () => {
    setTicketDateTime((prev) => [
      ...prev,
      {
        _id: prev.length + 1,
        date: eventDays[0]?.date ?? "",
        startTime: eventDays[0]?.startTime ?? "09:00",
        endTime: eventDays[0]?.endTime ?? "17:00",
      },
    ]);
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

  const removeTicketDay = (day: ITicketDateTime) => {
    setTicketDateTime((prev) => prev.filter((d) => d !== day));
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditData(null);
  };

  const isSubmitting = isSaving || isUpdating;
  const isUploading = images[0]?.status === "uploading";

  return (
    <ModalWrapper
      onClose={handleClose}
      height="max-h"
      maxWidth="max-w-3xl"
      showSpinner={isSubmitting || isUploading}
    >
      <div className="p-4 space-y-4">
        <h3 className={`text-xl ${textPrimary}`}>{t(MODAL_TITLES[opMode])}</h3>

        <section
          className={clsx(
            "px-3 py-5 space-y-6 max-h-[70vh] overflow-y-auto rounded-lg border",
            isDark
              ? "border-gray-700 bg-gray-800/50"
              : "border-gray-200 bg-gray-50",
          )}
        >
          {/* ── Name ─────────────────────────────────────────────────── */}
          <div
            ref={(el) => {
              sectionRefs.current["name"] = el;
            }}
          >
            <FormFieldWrapper
              required
              label={t("ticket_name")}
              error={errors.name}
              inputHintText={`${editData?.name?.length ?? 0}/50 ${t("max_characters")}`}
            >
              <input
                type="text"
                value={editData?.name ?? ""}
                maxLength={50}
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
            </FormFieldWrapper>
          </div>

          {/* ── Status ───────────────────────────────────────────────── */}
          <FormFieldWrapper label={t("ticket_status")}>
            <div className="flex gap-6">
              {(["active", "inactive"] as const).map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    value={opt}
                    checked={editData?.status === opt}
                    onChange={() =>
                      setEditData((prev: ITicketPayload) => ({
                        ...prev,
                        status: opt,
                      }))
                    }
                    className="w-5 h-5 text-teal-500"
                  />
                  <span
                    className={`text-base capitalize font-medium ${textSecondary} group-hover:text-teal-500`}
                  >
                    {tc(opt)}
                  </span>
                </label>
              ))}
            </div>
          </FormFieldWrapper>

          {/* ── Description ──────────────────────────────────────────── */}
          <div
            ref={(el) => {
              sectionRefs.current["description"] = el;
            }}
          >
            <FormFieldWrapper
              required
              label={t("description")}
              error={errors.description}
              inputHintText={`${editData?.description?.length ?? 0}/50 ${t("max_characters")}`}
            >
              <textarea
                maxLength={50}
                value={editData?.description ?? ""}
                onChange={(e) => {
                  setEditData((prev: ITicketPayload) => ({
                    ...prev,
                    description: e.target.value,
                  }));
                  clearError("description");
                }}
                placeholder={t("enter_ticket_description")}
                rows={2}
                className={clsx(
                  "w-full px-4 py-2.5 rounded-lg border transition-colors",
                  inputClasses,
                  errors.description && "field-error",
                )}
              />
            </FormFieldWrapper>
          </div>

          {/* ── Ticket Days ───────────────────────────────────────────── */}
          <section>
            <label className={`block text-sm mb-2 ${textSecondary}`}>
              {t("ticket_days")}
            </label>
            <div className="space-y-3">
              {ticketDateTime.map((day, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    if (el) sectionRefs.current[`day-${index}`] = el;
                  }}
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
                          errors.ticketDays[index] && "border-red-500",
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
                          errors.ticketDays[index] && "border-red-500",
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
                          errors.ticketDays[index] && "border-red-500",
                        )}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTicketDay(day)}
                      className="col-span-1 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md flex items-center justify-center"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  {errors.ticketDays[index] && (
                    <p className="text-sm text-red-500 mt-1 pl-1">
                      {errors.ticketDays[index]}
                    </p>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addTicketDay}
                className="border border-dashed border-teal-500 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30 rounded-md px-4 py-2.5 flex items-center justify-center w-full transition-colors"
              >
                <Plus size={18} className="mr-2" />
                {t("add_more_days")}
              </button>
            </div>
          </section>

          {/* ── Ticket Type ───────────────────────────────────────────── */}
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

          {/* ── Prices (paid/vip only) ────────────────────────────────── */}
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
                      price: {
                        ...prev.price,
                        markedPrice: val,
                        ...computeDiscounts(val, prev.price?.sellingPrice ?? 0),
                      },
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
                  <p className="mt-1 text-sm text-red-500">
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
                      price: {
                        ...prev.price,
                        sellingPrice: val,
                        ...computeDiscounts(prev.price?.markedPrice ?? 0, val),
                      },
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
                  <p className="mt-1 text-sm text-red-500">
                    {errors.sellingPrice}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm mb-2 ${textSecondary}`}>
                  {t("discount_amount")} (₪)
                </label>
                <input
                  type="number"
                  min={0}
                  value={editData?.price?.discountAmount || ""}
                  onChange={(e) => {
                    const discountAmount = parseFloat(e.target.value) || 0;
                    const markedPrice = editData?.price?.markedPrice ?? 0;
                    if (markedPrice > 0 && discountAmount <= markedPrice) {
                      const sellingPrice = markedPrice - discountAmount;
                      const discountPercent = Number(
                        ((discountAmount / markedPrice) * 100).toFixed(2),
                      );
                      setEditData((prev: ITicketPayload) => ({
                        ...prev,
                        price: {
                          ...prev.price,
                          discountAmount,
                          discountPercent,
                          sellingPrice,
                        },
                      }));
                    }
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg border ${inputClasses}`}
                />
              </div>

              <div>
                <label className={`block text-sm mb-2 ${textSecondary}`}>
                  {t("discount_percent")} (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={editData?.price?.discountPercent || ""}
                  onChange={(e) => {
                    const discountPercent = parseFloat(e.target.value) || 0;
                    const markedPrice = editData?.price?.markedPrice ?? 0;
                    if (markedPrice > 0 && discountPercent <= 100) {
                      const discountAmount = Number(
                        ((markedPrice * discountPercent) / 100).toFixed(2),
                      );
                      setEditData((prev: ITicketPayload) => ({
                        ...prev,
                        price: {
                          ...prev.price,
                          discountPercent,
                          discountAmount,
                          sellingPrice: markedPrice - discountAmount,
                        },
                      }));
                    }
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg border ${inputClasses}`}
                />
              </div>
            </div>
          )}

          {/* ── Quantity ──────────────────────────────────────────────── */}
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
                  setEditData((prev: ITicketPayload) => ({
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
                  setEditData((prev: ITicketPayload) => ({
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

          {/* ── Image upload ──────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-sm ${textSecondary}`}>
                {t("ticket_image")}
              </label>
              {images[0]?.status === "uploading" && (
                <div className="flex items-center gap-2 w-32">
                  <div className="w-full bg-gray-200 rounded h-2">
                    <div
                      className="bg-teal-600 h-2 rounded transition-all"
                      style={{ width: `${images[0].progress ?? 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {images[0].progress ?? 0}%
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
              {images[0]?.previewUrl ? (
                <div className="relative">
                  <ImageWithFallback
                    src={images[0].previewUrl}
                    alt="Ticket preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(images[0], 0)}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload
                    className={`w-10 h-10 mx-auto mb-2 ${textTertiary}`}
                  />
                  <p className={`text-sm ${textSecondary} mb-3`}>
                    {t("click_to_upload_or_drag")}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    id="ticket-image-upload"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length)
                        handleImageUpload(e.target.files);
                    }}
                  />
                  <label
                    htmlFor="ticket-image-upload"
                    className="inline-block px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg cursor-pointer transition-colors"
                  >
                    {t("browse_files")}
                  </label>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Footer actions ────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
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
            disabled={isSubmitting}
            className={clsx(
              "px-6 py-2.5 rounded-lg text-white transition-colors min-w-28",
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700 cursor-pointer",
            )}
          >
            {isSubmitting ? `${t("saving")}...` : t("save_ticket")}
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

export default TicketModal;
