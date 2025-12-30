import Image from "next/image";

import ContactForm from "./_components/ContactForm";

const page = () => {
  return (
    <div className="relative max-sm:pt-30">
      <Image
        width={417}
        height={300}
        unoptimized
        alt="contact form"
        className="w-full h-125 max-sm:hidden md:block object-cover"
        src={
          "https://storage.googleapis.com/bnei-fo5gz43xdb6i5t/images/background/contact-us.png"
        }
      />
      <ContactForm />
    </div>
  );
};

export default page;
