import { z } from "zod";

export const purchaserSchema = z
  .object({
    firstName: z.string().min(1, "שם פרטי נדרש"),
    phone: z.string().optional(),
    email: z
      .string()
      .optional()
      .refine(
        (val) => !val || z.string().email().safeParse(val).success,
        "אימייל לא תקין",
      ),
  })
  .superRefine((data, ctx) => {
    if (!data.phone && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "יש לספק לפחות טלפון או אימייל",
        path: ["phone"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "יש לספק לפחות טלפון או אימייל",
        path: ["email"],
      });
    }
  });

export type PurchaserInfo = z.infer<typeof purchaserSchema>;

export const DeliveryOptionType = z.enum(["deliver", "pick_up", ""]);

export const DeliveryOptionSchema = z.object({
  type: DeliveryOptionType,
  isGift: z.boolean(),
  method: z.string().optional(),
  fee: z.number(),
  pickupLocation: z.string().optional(),
  greeting: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z
    .object({
      city: z.string().optional(),
      street: z.string().optional(),
      houseNo: z.string().optional(),
      apartment: z.string().optional(),
      additionalInfo: z.string().optional(),
      area: z.string().optional(),
    })
    .optional(),
});

export enum PurchaseFlowType {
  CART = "cart",
  BUY_NOW = "buy_now",
}

export interface PurchaseState {
  customer: z.infer<typeof purchaserSchema>;
  deliveryOptions: Record<string, z.infer<typeof DeliveryOptionSchema>>; // ProductId: DeliveryOption
  purchaseFlow: PurchaseFlowType;
  buyNowProduct: null;
  voucher?: string[];
  cartId?: string;
  // actions
  updateCustomerDetails: (
    details: Partial<z.infer<typeof purchaserSchema>>,
  ) => void;
  updateProductDeliveryOption: (
    productId: string,
    deliveryOption: z.infer<typeof DeliveryOptionSchema>,
  ) => void;
  // initiateBuyNow: (product: CartItem) => void;
  // submitOrder: () => Promise<any>;
  clearOrder: () => void;
  clearCustomerInfoDeliveryOptions: () => void;
  // validateOrder: () => boolean;
}

export interface clearCustomerInfo {
  firstName: string;
  email: string;
  phone: string;
}

// -----------------Voucher Schema ------------------
export const voucherInputSchema = z.object({
  amountOfVouchers: z.coerce.number().positive("חייב להיות מספר חיובי"),
  voucherAmount: z.coerce.number().positive("חייב להיות מספר חיובי"),
  voucherType: z.enum(["private", "business"]),
});

export type VoucherInput = z.infer<typeof voucherInputSchema>;

const receiverInfoBaseSchema = z.object({
  receiverName: z.string().min(2, "שם הנמען חייב להכיל לפחות 2 תווים."),
  receiverMessage: z.string().min(5, "ההודעה חייבת להכיל לפחות 5 תווים."),
  receiverEmail: z
    .string()
    .email("כתובת מייל לא תקינה")
    .or(z.literal("").transform(() => undefined)) // Allow empty string as undefined
    .optional(),
  receiverPhone: z
    .string()
    .regex(/^\+?[0-9]\d{1,15}$/, "מספר טלפון לא חוקי.")
    .or(z.literal("").transform(() => undefined)) // Allow empty string as undefined
    .optional(),
});

// Ensure at least one is provided
export const receiverInfoSchema = receiverInfoBaseSchema
  .refine((data) => data.receiverEmail || data.receiverPhone, {
    message: "חובה להזין כתובת מייל או מספר טלפון",
    path: ["receiverEmail"], // Apply error to receiverEmail
  })
  .refine((data) => data.receiverEmail || data.receiverPhone, {
    message: "חובה להזין כתובת מייל או מספר טלפון",
    path: ["receiverPhone"], // Apply error to receiverPhone too
  });

export const senderInfoSchema = z.object({
  senderName: z.string().min(1, "שם השולח חייב להכיל לפחות 1 תווים."),
  senderEmail: z.string().email("כתובת מייל לא תקינה"),
  senderPhone: z
    .string()
    .regex(/^\+?[0-9]\d{1,15}$/, "מספר טלפון לא חוקי.")
    .optional()
    .or(z.literal("")),
});

export type ReceiverInfo = z.infer<typeof receiverInfoSchema>;
export type SenderInfo = z.infer<typeof senderInfoSchema>;

export type PrivateVoucherFormState = VoucherInput & ReceiverInfo & SenderInfo;
