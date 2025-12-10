import ContactUsInfo from "@/components/ContactUsInfo";
import { getContactDetails } from "@/constant/siteInfo";

const MobileContactInfo = () => {
  const contactInfo = getContactDetails();
  return (
    <div className="items-center justify-between text-charcoal max-sm:flex md:hidden">
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
        href={`https://wa.me/${"+972" + contactInfo?.whatsapp?.replace(/\D/g, "")}`}
      />
    </div>
  );
};

export default MobileContactInfo;
