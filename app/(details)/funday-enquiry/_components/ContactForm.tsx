"use client";

import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { contactUsText, fundayEnquiryLables } from "@/constant/hebrew";
import { Dialog } from "@/components/ui";
import { sendEmail } from "@/actions/contactUsAction";
import { ContactFormData, contactFormSchema } from "@/schemas/contact";
import ContactInfo from "../../_components/ContactInfo";

const InputField = ({ type = "text", placeholder, register, error }: any) => (
  <div className="flex flex-col w-full font-normal">
    <input
      type={type}
      placeholder={placeholder}
      {...register}
      className={`h-12 px-3 w-full rounded-lg border ${error ? "border-red-500" : "border-secondary"}`}
    />
    {error && (
      <span className="text-red-500 text-sm mt-1">{error.message}</span>
    )}
  </div>
);

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
      reason: "FunDays",
      websiteIdentity: "negevTime",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);

      const response = await sendEmail(data);
      console.log("🚀 ~ onSubmit ~ response:", response);
      if (response.success) {
        reset();
        setIsSubmitSuccess(true);
      } else {
        console.error("Something went wrong");
      }
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="relative max-sm:h-96 md:h-[60vh] flex items-center justify-center">
        <div
          className="
      max-sm:relative md:absolute 
      max-sm:top-30 md:-top-64 
      md:left-1/2 md:-translate-x-1/2  
      space-y-9.5 w-full md:w-2xl
    "
        >
          <div className="bg-white md:border border-lightGray rounded-2xl max-sm:w-full max-sm:p-4 md:p-10">
            <div className="flex flex-col items-center justify-center max-sm:my-10 md:mb-10 text-dark text-center w-full">
              <h2 className="font-bold text-2xl">
                {fundayEnquiryLables.title}
              </h2>
              <p className="font-normal max-sm:w-90 md:w-74">
                {fundayEnquiryLables.description}
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-3 mt-4 max-sm:px-4 md:px-10"
            >
              <InputField
                placeholder={fundayEnquiryLables.whatIsYourName}
                register={register("name")}
                error={errors.name}
              />

              <InputField
                type="number"
                placeholder={fundayEnquiryLables.mobile}
                register={register("phone")}
                error={errors.phone}
              />

              <InputField
                type="email"
                placeholder={fundayEnquiryLables.mail}
                register={register("email")}
                error={errors.email}
              />

              <textarea
                rows={4}
                {...register("message")}
                placeholder={fundayEnquiryLables.whatIsImportantInYourDay}
                className="p-3 rounded-lg border border-lightGray resize-none font-normal"
              />

              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className={clsx(
                  isSubmitting || !isValid
                    ? "bg-lightGray cursor-not-allowed"
                    : "bg-dark custom-cursor",
                  "mx-auto h-12 w-38 mt-10 text-white font-bold rounded-xl",
                )}
              >
                {isSubmitting ? contactUsText.contactUs : "שליחה"}
              </button>
            </form>
          </div>

          <ContactInfo />
        </div>
      </section>

      {/* Success Dialog */}
      {isSubmitSuccess && (
        <Dialog
          isOpen={isSubmitSuccess}
          onClose={() => setIsSubmitSuccess(false)}
          className="max-sm:w-[84%] max-sm:mx-8 md:w-[430px] top-60"
        >
          {/* This div should be relative and overflow-hidden */}
          <div className="relative overflow-hidden w-full flex flex-col items-center py-16 z-50 rounded-xl">
            <h1 className="text-2xl font-bold text-dark">
              {contactUsText.messageSuccess}
            </h1>
            <p className="text-dark text-center">{contactUsText.thankYou}</p>

            <Link
              href="/"
              className="bg-dark text-white rounded-2xl px-4 py-2.75 mt-6.5"
            >
              {contactUsText.backToMainPage}
            </Link>

            <Image
              width={180}
              height={184}
              alt="Yellow Chrysanthemum"
              src="/images/yellow-chrysanthemum.png"
              className="absolute -left-15 -bottom-20"
            />
          </div>
        </Dialog>
      )}
    </>
  );
};

export default ContactForm;
