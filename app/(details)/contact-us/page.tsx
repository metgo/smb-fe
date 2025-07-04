import React from "react";
import ContactForm from "../_components/ContactForm";
import Image from "next/image";
import { contactUsText } from "@/constant/hebrew";

const page = () => {
  return (
    <div className="">
      <div className="px-20 py-7">
        <span className="font-bold text-dark">{contactUsText.contactUs}</span>
      </div>
      <Image
        src={"/images/contact-us.png"}
        alt="contact form"
        width={417}
        height={417}
        className="w-full"
      />
      <ContactForm />
    </div>
  );
};

export default page;
