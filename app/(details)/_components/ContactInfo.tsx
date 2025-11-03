import { IconImage } from "@/components/ui";
import { menuItems } from "@/constant/hebrew";
import { siteInfo } from "@/constant/siteInfo";

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
    <span>{text}</span>
  </a>
);

const ContactInfo = () => {
  const { contactInfo } = siteInfo["negevTime"];

  return (
    <div className="items-center gap-7.5 text-charcoal max-sm:hidden md:flex">
      <span>{menuItems.contactUs}</span>

      {/* Phone */}
      <ContactUsInfo
        icon="phone"
        text={contactInfo.phone}
        href={`tel:${contactInfo.phone.replace(/\s+/g, "")}`}
      />

      {/* Email */}
      <ContactUsInfo
        icon="mail"
        text={contactInfo.mail}
        href={`mailto:${contactInfo.mail}`}
      />

      {/* WhatsApp */}
      <ContactUsInfo
        icon="whatsapp-outlined"
        text={contactInfo.whatsapp}
        href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, "")}`}
      />
    </div>
  );
};

export default ContactInfo;
