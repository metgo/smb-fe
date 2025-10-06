import React from "react";
import ContactForm from "../_components/ContactForm";
import Image from "next/image";
import { contactUsText } from "@/constant/hebrew";

const page = () => {
  return (
    <div className="relative">
      <div className="px-20 py-7">
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
