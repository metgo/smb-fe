import { IconImage } from "@/components/ui";
import { menuItems } from "@/constant/hebrew";
import { businessDetails } from "@/constant/placeholderData";

const ConstatUsInfo = ({ icon, text }: { icon: string; text: string }) => (
  <div className=" flex items-center gap-2.5">
    <IconImage icon={icon} />
    <span>{text}</span>
  </div>
);

const ContactInfo = () => {
  return (
    <div className="flex items-center gap-7.5 text-charcoal">
      <span>{menuItems.contactUs}</span>
      <ConstatUsInfo icon="phone" text={businessDetails.phone} />
      <ConstatUsInfo icon="mail" text={businessDetails.mail} />
      <ConstatUsInfo icon="whatsapp-outlined" text={businessDetails.whatsapp} />
    </div>
  );
};

export default ContactInfo;
