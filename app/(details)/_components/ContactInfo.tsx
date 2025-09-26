import { IconImage } from "@/components/ui";
import { menuItems } from "@/constant/hebrew";
import { siteInfo } from "@/constant/siteInfo";

const ConstatUsInfo = ({ icon, text }: { icon: string; text: string }) => (
  <div className=" flex items-center gap-2.5">
    <IconImage icon={icon} />
    <span>{text}</span>
  </div>
);

const ContactInfo = () => {
  const { contactInfo } = siteInfo["negevTime"];
  return (
    <div className="items-center gap-7.5 text-charcoal max-sm:hidden md:flex">
      <span>{menuItems.contactUs}</span>
      <ConstatUsInfo icon="phone" text={contactInfo.phone} />
      <ConstatUsInfo icon="mail" text={contactInfo.mail} />
      <ConstatUsInfo icon="whatsapp-outlined" text={contactInfo.whatsapp} />
    </div>
  );
};

export default ContactInfo;
