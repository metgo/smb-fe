import { urls } from "@/lib/endpoints";
import { ContactFormData, FundayFormData } from "@/schemas/contact";

export const sendEmail = async (formData: ContactFormData) => {
  const res = await fetch(urls.sendContactInfo, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (res.ok) {
    return { success: true, data: await res.json() };
  } else {
    let error;
    try {
      error = await res.json();
    } catch {
      error = { message: "Unknown error" };
    }
    return { success: false, error };
  }
};

export const sendFundayEnquiryEmail = async (formData: FundayFormData) => {
  const res = await fetch(urls.fundayEnquiry, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (res.ok) {
    return { success: true, data: await res.json() };
  } else {
    let error;
    try {
      error = await res.json();
    } catch {
      error = { message: "Unknown error" };
    }
    return { success: false, error };
  }
};
