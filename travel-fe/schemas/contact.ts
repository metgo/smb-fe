import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, { message: "נא להזין שם מלא" }),
  phone: z.string().min(9, { message: "מספר טלפון אינו תקין" }),
  email: z.string().email({ message: "כתובת מייל אינה תקינה" }),
  message: z.string().optional(),
  reason: z.string().min(1, { message: "נא לבחור סיבת פניה" }),
  websiteIdentity: z.string(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const fundayFormSchema = z.object({
  name: z.string().min(2, { message: "נא להזין שם מלא" }),
  phone: z.string().min(9, { message: "מספר טלפון אינו תקין" }),
  email: z.string().email({ message: "כתובת מייל אינה תקינה" }),
  message: z.string().optional(),
  identifierId: z.string().optional(),
  websiteEmail: z.string().optional(),
});

export type FundayFormData = z.infer<typeof fundayFormSchema>;
