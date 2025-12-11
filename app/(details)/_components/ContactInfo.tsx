import { menuItems, misc } from "@/constant/hebrew";
import ContactUsInfo from "@/components/ContactUsInfo";
import { getContactDetails } from "@/constant/siteInfo";

const ContactInfo = () => {
  const contactInfo = getContactDetails();
  return (
    <div className="items-center gap-7.5 text-charcoal md:flex max-sm:hidden">
      <span>{menuItems.contactUs}</span>

      {/* Phone */}
      <ContactUsInfo
        icon="phone"
        text={contactInfo.phone}
        href={`tel:${"+972" + contactInfo?.phone?.replace(/\s+/g, "")}`}
      />

      {/* Email */}
      <ContactUsInfo
        isEmail
        icon="mail"
        text={contactInfo?.mail}
        href={`mailto:${contactInfo?.mail}`}
      />

      {/* WhatsApp */}
      <ContactUsInfo
        icon="whatsapp-outlined"
        text={contactInfo.whatsapp}
        href={`https://wa.me/${"+972" + contactInfo?.whatsapp?.replace(/\D/g, "")}&text=${misc.whatsappText}`}
      />
    </div>
  );
};

export default ContactInfo;
