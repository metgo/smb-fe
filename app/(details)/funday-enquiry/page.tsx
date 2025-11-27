import React from "react";
import Image from "next/image";

import { contactUsText } from "@/constant/hebrew";
import ContactForm from "./_components/ContactForm";

const page = () => {
  return (
    <div className="relative max-sm:pt-30">
      <div className=" max-sm:px-8 md:px-20 py-7">
        <span className="font-bold text-dark">{contactUsText.contactUs}</span>
      </div>
      <Image
        width={417}
        height={300}
        unoptimized
        alt="contact form"
        className="w-full h-[500px] max-sm:hidden md:block object-cover"
        src={
          "https://storage.googleapis.com/bnei-fo5gz43xdb6i5t/images/background/contact-us.png"
        }
      />
      <ContactForm />
    </div>
  );
};

export default page;
