import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ModalWrapper } from "@/components/wrapper";
import SubmitButton from "@/components/btns/SubmitButton";
import InputField from "@/components/form-fields/InputField";
import TextareaField from "@/components/form-fields/TextareaField";
import { useCreateLandingPageSessionBlockMutation } from "@/store/api/eventSessionApi";
import ReactMultiSelect, { type MultiSelectOption } from "@/components/form-fields/ReactMultiSelect";

interface BlockSessionAssignModalProps {
  config: IAdminConfig;
  onChange: (config: IAdminConfig) => void;
  setIsOpen: (v: boolean) => void;
  wrapperId: string | null;
  editData?: ISessionBlock;
}

export default function BlockSessionAssignModal({ setIsOpen, config, wrapperId, editData }: BlockSessionAssignModalProps) {
  const { t } = useTranslation("event_session");
  const [createLandingPageSessionBlock, { isLoading: isCreating }] = useCreateLandingPageSessionBlockMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bookingLimit, setBookingLimit] = useState(0);
  const [sessionIds, setSessionIds] = useState<string[]>( editData ? editData.sessionIds :[]);
  console.log("🚀 ~ BlockSessionAssignModal ~ sessionIds:", sessionIds)

  const sessionOptions: MultiSelectOption[] = config.sessions
    .filter((session) => {
      // Collect all session IDs from existing blocks
      const usedSessionIds = config.blocks?.flatMap((block) => block.sessionIds) || [];

      // If editing, include the current block's session IDs
      const currentBlockSessionIds = editData?.sessionIds || [];

      // Allow session if it's not used in any block, or if it's in the current block being edited
      return !usedSessionIds.includes(session._id) || currentBlockSessionIds.includes(session._id);
    })
    .map((session) => ({
      label: session.name,
      value: session._id,
    }));

  console.log("🚀 ~ BlockSessionAssignModal ~ sessionOptions:", sessionOptions);

  useEffect(() => {
    if (editData) {
      console.log("🚀 ~ BlockSessionAssignModal ~ editData:", editData)
      setName(editData.name);
      setDescription(editData.description);
      setBookingLimit(editData.bookingLimit);
      setSessionIds(editData.sessionIds);
    }
  }, [editData])

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
          method: "PATCH"
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
      onClose={() => setIsOpen(false)}
      height="max-sm:h-[90vh] md:h-max p-4"
      maxWidth="max-w-2xl"
    >

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t("create_session_block")}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t("name")} <span className="text-red-500">*</span></label>
            <InputField
              value={name}
              onChange={setName}
              placeholder={t("enter_name")}
              inputClasses="border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t("booking_limit")} <span className="text-red-500">*</span></label>
            <InputField
              type="number"
              maxLength={sessionOptions?.length || 1}
              value={bookingLimit.toString()}
              onChange={(v) => {
                const value = Number(v);
                if (value > 0 && (sessionOptions?.length === 0 || value <= sessionOptions?.length)) {
                  setBookingLimit(value);
                }
              }}
              placeholder={t("enter_booking_limit")}
              inputClasses="border-gray-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t("description")} <span className="text-red-500">*</span></label>
          <TextareaField
            value={description}
            onChange={setDescription}
            placeholder={t("enter_description")}
            rows={3}
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
      </div>

      <div className="flex items-center justify-end mt-12">
        <div className="w-40">
          <SubmitButton
            loading={isCreating}
            label={t("create_block")}
            className="bg-teal-600 hover:bg-teal-700 text-white h-12"
            onClick={handleSubmit}
            isDisabled={!name || !description || bookingLimit <= 0 || sessionIds.length === 0}
          />
        </div>
      </div>
    </ModalWrapper>
  );
}