import { urls } from "@/lib/endpoints";
import { ContactFormData } from "@/schema/contact";

export const sendEmail = async (formData: ContactFormData) => {
  const res = await fetch(urls.sendContactInfo, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  return res.json();
};
