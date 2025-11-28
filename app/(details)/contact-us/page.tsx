import React from "react";
import Image from "next/image";

import ContactForm from "../_components/ContactForm";
import { contactUsText } from "@/constant/hebrew";
import { getContactPageBg } from "@/constant/images";

const page = () => {
  const bgImageSrc = getContactPageBg();
  return (
    <div className="relative max-sm:pt-30">
      <div className=" max-sm:px-8 md:px-20 py-7">
        <span className="font-bold text-dark">{contactUsText.contactUs}</span>
      </div>
      <Image
        width={417}
        height={600}
        unoptimized
        alt="contact form"
        className="w-full h-[600px] object-cover max-sm:hidden md:block"
        src={bgImageSrc}
      />
      <ContactForm />
    </div>
  );
};

export default page;
