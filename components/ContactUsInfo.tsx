import { IconImage } from "./ui";

const ContactUsInfo = ({
  icon,
  text,
  href,
  isEmail = false,
}: {
  icon: string;
  text: string;
  href: string;
  isEmail?: boolean;
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
    <span>{isEmail ? text : `0${text}`}</span>
  </a>
);

export default ContactUsInfo;
