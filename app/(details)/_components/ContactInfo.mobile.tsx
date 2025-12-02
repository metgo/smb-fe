import { IconImage } from "@/components/ui";
import { getContactDetails } from "@/constant/siteInfo";

const ContactUsInfo = ({
  icon,
  text,
  href,
}: {
  icon: string;
  text: string;
  href: string;
}) => (
  <a
    href={href}
    className="flex items-center gap-2.5 hover:underline transition-colors custom-cursor"
    target={
      href.startsWith("http") || href.startsWith("mailto") ? "_blank" : "_self"
    }
    rel="noopener noreferrer"
  >
    <IconImage icon={icon} />
    <span className="text-sm">{text}</span>
  </a>
);

const MobileContactInfo = () => {
  const contactInfo = getContactDetails();
  return (
    <div className="items-center justify-between text-charcoal max-sm:flex md:hidden">
      {/* Email */}
      <ContactUsInfo
        icon="mail"
        text={contactInfo?.mail}
        href={`mailto:${contactInfo?.mail}`}
      />
      {/* WhatsApp */}
      <ContactUsInfo
        icon="whatsapp-outlined"
        text={contactInfo.whatsapp}
        href={`https://wa.me/${contactInfo?.whatsapp?.replace(/\D/g, "")}`}
      />
    </div>
  );
};

export default MobileContactInfo;
