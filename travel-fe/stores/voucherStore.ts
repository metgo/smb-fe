import {
  PrivateVoucherFormState,
  ReceiverInfo,
  SenderInfo,
  VoucherInput,
} from "@/schemas/payment";
import { create } from "zustand";

export const useVoucherStore = create<VoucherDetailsState>()((set) => ({
  voucherDetails: [] as VoucherDetails[],
  removeVoucher: (code: string) =>
    set((state) => ({
      voucherDetails: state.voucherDetails.filter((item) => item.code !== code),
    })),

  createVoucher: (item) => {
    const currentTime = new Date();
    const expiryTime = new Date(currentTime.getTime() + 15 * 60 * 1000);

    set((state) => {
      const existingItem = state.voucherDetails.find(
        (i) => i.code === item.code,
      );
      if (existingItem) {
        return state; // Return the current state if the voucher already exists
      }

      const newVoucher = { ...item, time: expiryTime };

      // Set a timeout to remove the voucher after 15 minutes
      setTimeout(
        () => {
          set((state) => ({
            voucherDetails: state.voucherDetails.filter(
              (voucher) => voucher.code !== item.code,
            ),
          }));
        },
        15 * 60 * 1000,
      );

      return { voucherDetails: [...state.voucherDetails, newVoucher] };
    });
  },

  clearVoucher: () => set({ voucherDetails: [] as VoucherDetails[] }),
}));

interface PrivateVoucherFormStore {
  formData: Partial<PrivateVoucherFormState>;

  currentStep: "voucherDetails" | "receiver" | "sender" | "purchase";
  purchaseStatus: "success" | "failure" | null;

  stepValidation: {
    voucherDetails: boolean;
    receiverInfo: boolean;
    senderInfo: boolean;
  };

  updateVoucherDetails: (data: Partial<VoucherInput>) => void;
  updateReceiverInfo: (data: Partial<ReceiverInfo>) => void;
  updateSenderInfo: (data: Partial<SenderInfo>) => void;
  setStepValidation: (
    step: keyof PrivateVoucherFormStore["stepValidation"],
    value: boolean,
  ) => void;
  setCurrentStep: (step: PrivateVoucherFormStore["currentStep"]) => void;
  setPurchaseStatus: (
    status: PrivateVoucherFormStore["purchaseStatus"],
  ) => void;
  resetForm: () => void;
}

// initial value
const defaultPrivateFormData: Partial<PrivateVoucherFormState> = {
  amountOfVouchers: undefined,
  voucherAmount: undefined,
  voucherType: "private",
  receiverName: "",
  receiverMessage: "",
  receiverEmail: undefined,
  receiverPhone: undefined,
  senderName: "",
  senderEmail: "",
  senderPhone: "",
};

export const usePrivateVoucherFormStore = create<PrivateVoucherFormStore>(
  (set) => ({
    // initial state
    formData: defaultPrivateFormData,
    currentStep: "receiver",
    purchaseStatus: null,
    stepValidation: {
      voucherDetails: false,
      receiverInfo: false,
      senderInfo: false,
    },

    // actions
    updateVoucherDetails: (data) =>
      set((state) => ({
        formData: {
          ...state.formData,
          ...data,
        },
      })),

    updateReceiverInfo: (data) =>
      set((state) => ({
        formData: {
          ...state.formData,
          ...data,
        },
      })),

    updateSenderInfo: (data) =>
      set((state) => ({
        formData: {
          ...state.formData,
          ...data,
        },
      })),

    setStepValidation: (step, isValid) =>
      set((state) => ({
        stepValidation: {
          ...state.stepValidation,
          [step]: isValid,
        },
      })),

    setCurrentStep: (step) =>
      set(() => ({
        currentStep: step,
      })),

    setPurchaseStatus: (status) =>
      set(() => ({
        purchaseStatus: status,
      })),

    resetForm: () =>
      set(() => ({
        formData: defaultPrivateFormData,
        currentStep: "receiver",
        purchaseStatus: null,
        stepValidation: {
          voucherDetails: false,
          receiverInfo: false,
          senderInfo: false,
        },
      })),
  }),
);
