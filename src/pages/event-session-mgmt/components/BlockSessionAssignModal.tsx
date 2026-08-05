import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ModalWrapper } from "@/components/wrapper";
import SubmitButton from "@/components/btns/SubmitButton";
import InputField from "@/components/form-fields/InputField";
import TextareaField from "@/components/form-fields/TextareaField";
import { useCreateLandingPageSessionBlockMutation } from "@/store/api/eventSessionApi";
import ReactMultiSelect, {
  type MultiSelectOption,
} from "@/components/form-fields/ReactMultiSelect";

interface BlockSessionAssignModalProps {
  config: IAdminConfig;
  onChange: (config: IAdminConfig) => void;
  setIsOpen: (v: boolean) => void;
  wrapperId: string | null;
  editData?: ISessionBlock;
  setEditData?: (data: ISessionBlock | null) => void;
}

// sessionIds may come back from the API as plain string ids or as
// populated session objects, so normalize before comparing/using them.
function toSessionId(sessionId: string | { _id: string }): string {
  return typeof sessionId === "string" ? sessionId : sessionId?._id;
}

function toSessionIds(sessionIds?: (string | { _id: string })[]): string[] {
  return (sessionIds || []).map(toSessionId).filter(Boolean);
}

export default function BlockSessionAssignModal({
  setIsOpen,
  config,
  wrapperId,
  editData,
  setEditData,
}: BlockSessionAssignModalProps) {
  const { t } = useTranslation("event_session");
  const [createLandingPageSessionBlock, { isLoading: isCreating }] =
    useCreateLandingPageSessionBlockMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bookingLimit, setBookingLimit] = useState(0);
  const [bookingLimitError, setBookingLimitError] = useState(false);
  const [sessionIds, setSessionIds] = useState<string[]>(
    editData ? toSessionIds(editData.sessionIds) : [],
  );

  const sessionOptions: MultiSelectOption[] = (() => {
    // Get all session IDs that are already assigned to blocks
    const assignedSessionIds = new Set<string>();
    config.blocks?.forEach((block) => {
      // In edit mode, exclude the current block's sessions from the assigned check
      if (editData && block._id === editData._id) return;
      toSessionIds(block.sessionIds).forEach((id) => {
        assignedSessionIds.add(id);
      });
    });

    // Show only sessions not assigned to any other block (current block's
    // own sessions are already excluded from assignedSessionIds above)
    const filteredSessions = config.sessions.filter(
      (session) => !assignedSessionIds.has(session._id || ""),
    );

    return filteredSessions.map((session) => ({
      label: session.name,
      value: session._id,
      image:
        session.images?.find((img) => img.isPrimary)?.image ||
        session.images?.[0]?.image,
    }));
  })();

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setDescription(editData.description);
      setBookingLimit(editData.bookingLimit);
      setSessionIds(toSessionIds(editData.sessionIds));
    } else {
      // Reset form fields when switching to create mode
      setName("");
      setDescription("");
      setBookingLimit(0);
      setSessionIds([]);
      setBookingLimitError(false);
    }
  }, [editData]);

  const handleSubmit = async () => {
    if (!wrapperId) return;
    try {
      if (editData && wrapperId) {
        await createLandingPageSessionBlock({
          wrapperId,
          data: {
            name,
            description,
            bookingLimit,
            sessionIds,
            isActive: true,
            blockId: editData._id,
          },
          method: "PATCH",
        }).unwrap();
      } else {
        await createLandingPageSessionBlock({
          wrapperId,
          data: {
            name,
            description,
            bookingLimit,
            sessionIds,
            isActive: true,
          },
        }).unwrap();
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create session block:", error);
    }
  };

  return (
    <ModalWrapper
      onClose={() => {
        setIsOpen(false);
        setEditData?.(null);
      }}
      height="max-sm:h-[90vh] md:h-max p-4"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t("create_session_block")}</h2>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t("name")} <span className="text-red-500">*</span>
          </label>
          <InputField
            value={name}
            onChange={setName}
            placeholder={t("enter_name")}
            inputClasses="border-gray-300"
          />
        </div>

        <div>
          <ReactMultiSelect
            label={t("select_sessions") + " *"}
            options={sessionOptions}
            value={sessionIds}
            onChange={setSessionIds}
            placeholder={t("select_sessions_placeholder")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t("booking_limit")} <span className="text-red-500">*</span>
            <span className="ps-3 text-xs italic">
              {t("max_limit")} {sessionIds?.length || 1}
            </span>
          </label>
          <InputField
            type="number"
            maxLength={sessionIds?.length || 1}
            value={bookingLimit.toString() || "1"}
            onChange={(v) => {
              const value = Number(v);
              const maxLimit = sessionIds?.length || 1;

              if (value > maxLimit) {
                setBookingLimitError(true);
              } else {
                setBookingLimitError(false);
              }

              if (
                value > 0 &&
                (sessionIds?.length === 0 || value <= sessionIds?.length)
              ) {
                setBookingLimit(value);
              }
            }}
            placeholder={t("enter_booking_limit")}
            inputClasses={
              bookingLimitError ? "border-red-500" : "border-gray-300"
            }
          />
          {bookingLimitError && (
            <p className="text-xs text-red-500 mt-1">
              {t("booking_limit_exceeded", { max: sessionIds?.length || 1 })}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t("description")} <span className="text-red-500">*</span>
          </label>
          <TextareaField
            value={description}
            onChange={setDescription}
            placeholder={t("enter_description")}
            rows={3}
            inputClasses="border-gray-300"
          />
        </div>
      </div>

      <div className="flex items-center justify-end mt-6">
        <div className="w-40">
          <SubmitButton
            loading={isCreating}
            label={t("create_block")}
            className="bg-teal-600 hover:bg-teal-700 text-white h-12"
            onClick={handleSubmit}
            isDisabled={
              !name ||
              !description ||
              bookingLimit <= 0 ||
              sessionIds.length === 0
            }
          />
        </div>
      </div>
    </ModalWrapper>
  );
}
