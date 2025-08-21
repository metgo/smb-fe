import { formLabels } from "./hebrew";

export const voucherFields: FieldConfig[] = [
  {
    id: "amountOfVouchers",
    label: "כמות תווים",
    type: "number",
    required: true,
    className: "w-full bg-white h-12",
    containerClassName: "max-sm:mx-auto max-sm:w-[80%] sm:w-[13rem]",
  },
  {
    id: "voucherAmount",
    label: "סכום כל תו",
    type: "number",
    required: true,
    className: "w-full bg-white h-12",
    containerClassName: "max-sm:mx-auto max-sm:w-[80%] sm:w-[13rem]",
    isPriceField: true,
  },
];

// Used
export const orderInfoFields: FieldConfig[] = [
  {
    id: "firstName",
    label: formLabels.fullName,
    type: "text",
    required: true,
    className: "max-sm:w-full w-[650px]",
  },
  {
    id: "phone",
    label: formLabels.phone,
    type: "number",
    required: false,
    className: "max-sm:w-full w-[650px]",
  },
  {
    id: "email",
    label: formLabels.email,
    type: "email",
    required: false,
    className: "max-sm:w-full w-[650px]",
  },
];

export const giftReceiverInfoFields: FieldConfig[] = [
  {
    id: "receiverPhone",
    label: formLabels.receiverPhone,
    type: "number",
    required: true,
    className: "max-sm:w-full w-[320px] text-right",
  },
  {
    id: "receiverEmail",
    label: formLabels.receiverEmail,
    type: "email",
    required: true,
    className: "max-sm:w-full w-[320px]",
  },
  {
    id: "receiverMessage",
    label: formLabels.receiverMessage,
    type: "textarea",
    rows: 4,
    required: true,
    className: "max-sm:w-full md:min-w-[650px] resize-none",
  },
];

export const deliveryAddressFields: FieldConfig[] = [
  {
    id: "city",
    label: formLabels.city,
    type: "text",
    required: true,
    className: "max-sm:w-full w-[320px] text-right",
  },
  {
    id: "street",
    label: formLabels.street,
    type: "text",
    required: true,
    className: "max-sm:w-full w-[320px]",
  },
  {
    id: "houseNo",
    label: formLabels.houseNo,
    type: "number",
    required: true,
    className: "max-sm:w-full w-[320px]",
  },
  {
    id: "apartment",
    label: formLabels.apartment,
    type: "text",
    required: true,
    className: "max-sm:w-full w-[320px]",
  },
  {
    id: "greeting",
    label: formLabels.greeting,
    type: "textarea",
    rows: 4,
    required: true,
    className: "max-sm:w-full md:min-w-[73%] resize-none",
  },
];
