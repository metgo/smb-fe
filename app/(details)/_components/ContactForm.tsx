"use client";

import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import ContactInfo from "./ContactInfo";
import { contactUsText } from "@/constant/hebrew";
import { Dialog, IconImage } from "@/components/ui";
import { sendEmail } from "@/actions/contactUsAction";
import { ContactFormData, contactFormSchema } from "@/schemas/contact";
import { contactFormReasonOptions } from "@/lib/utils";
import ReturnToPrevPageBtn from "./ReturnToPrevPageBtn";

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

const SelectField = ({ control, name, error }: any) => (
  <div className="relative w-full font-normal">
    <Controller
      name={name}
      control={control}
      rules={{ required: "נא לבחור סיבת פניה" }}
      render={({ field }) => (
        <div className="relative">
          <select
            {...field}
            className={`rounded-lg p-2 px-3 h-12 w-full custom-cursor font-normal bg-white appearance-none border
              ${error ? "border-red-500" : "border-lightGray"}
              ${!field.value ? "text-gray-500" : "text-black"}`}
          >
            <option value="" disabled>
              {contactUsText.referralReason}
            </option>
            {contactFormReasonOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="text-black custom-cursor"
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute top-1/2 left-3 transform -translate-y-1/2 pointer-events-none">
            <IconImage icon="down-arrow" width={12} height={12} />
          </div>
        </div>
      )}
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
    control,
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
      reason: "",
      websiteIdentity: "negevTime",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);

      const response = await sendEmail(data);
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
      md:left-1/2 md:-translate-x-1/2  /* ✅ Center horizontally for md devices */
      space-y-9.5 w-full md:w-2xl
    "
        >
          <div className="bg-white md:border border-lightGray rounded-2xl max-sm:w-full max-sm:p-4 md:p-10">
            <div className="md:hidden max-sm:block mt-8">
              <ReturnToPrevPageBtn />
            </div>

            <div className="flex flex-col items-center justify-center max-sm:my-10 md:mb-10 text-dark text-center w-full">
              <h2 className="font-bold text-2xl">{contactUsText.title}</h2>
              <p className="font-normal max-sm:w-90">{contactUsText.desc}</p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-3 mt-4 max-sm:px-4 md:px-10"
            >
              <InputField
                placeholder={contactUsText.fullName}
                register={register("name")}
                error={errors.name}
              />

              <InputField
                type="number"
                placeholder={contactUsText.mobile}
                register={register("phone")}
                error={errors.phone}
              />

              <InputField
                type="email"
                placeholder={contactUsText.mail}
                register={register("email")}
                error={errors.email}
              />

              <SelectField
                control={control}
                name="reason"
                error={errors.reason}
              />

              <textarea
                rows={4}
                {...register("message")}
                placeholder={contactUsText.referralDetails}
                className="p-3 rounded-lg border border-lightGray resize-none font-normal"
              />

              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className={clsx(
                  isSubmitting || !isValid
                    ? "bg-lightGray cursor-not-allowed"
                    : "bg-dark custom-cursor",
                  "mx-auto h-12 w-52 mt-10 text-white font-bold rounded-xl",
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
