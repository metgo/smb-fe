import { z } from "zod";

export const contactFormSchema = z.object({
  reason: z.string().min(1, { message: "נא לבחור סיבת פניה" }),
  name: z.string().min(2, { message: "נא להזין שם מלא" }),
  orgName: z.string().optional(),
  phone: z.string().min(9, { message: "מספר טלפון אינו תקין" }),
  email: z.string().email({ message: "כתובת מייל אינה תקינה" }),
  message: z.string().optional(),
  websiteIdentity: z.string(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
