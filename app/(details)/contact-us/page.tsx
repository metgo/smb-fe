import React from "react";
import Image from "next/image";

import ContactForm from "../_components/ContactForm";
import { contactUsText } from "@/constant/hebrew";

const page = () => {
  return (
    <div className="relative max-sm:pt-30">
      <div className=" max-sm:px-8 md:px-20 py-7">
        <span className="font-bold text-dark">{contactUsText.contactUs}</span>
      </div>
      <Image
        width={417}
        height={417}
        unoptimized
        alt="contact form"
        className="w-full max-sm:hidden md:block"
        src={"/images/contact-us.png"}
      />
      <ContactForm />
    </div>
  );
};

export default page;
