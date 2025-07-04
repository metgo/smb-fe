"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { contactUsText } from "@/constant/hebrew";
import { ContactFormData, contactFormSchema } from "@/schema/contact";
import { Dialog, IconImage } from "@/components/ui";
import ContactInfo from "./ContactInfo";
import Link from "next/link";
import Image from "next/image";

const reasonOptions = [
  { value: "characters", label: "תווים" },
  { value: "business", label: "עסקים" },
  { value: "employers", label: "מעסיקים" },
  { value: "technical support", label: "תמיכה טכנית" },
  { value: "cancellation of tansaction", label: "ביטול עסקה" },
];

const InputField = ({ type = "text", placeholder, register, error }: any) => (
  <div className="flex flex-col w-full">
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
  <div className="relative w-full">
    <Controller
      name={name}
      control={control}
      rules={{ required: "נא לבחור סיבת פניה" }}
      render={({ field }) => (
        <div className="relative">
          <select
            {...field}
            className={`rounded-lg p-2 px-3 h-12 w-full cursor-pointer bg-white appearance-none border
              ${error ? "border-red-500" : "border-lightGray"}
              ${!field.value ? "text-gray-500" : "text-black"}`}
          >
            <option value="" disabled>
              *{contactUsText.referralReason}
            </option>
            {reasonOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="text-black cursor-pointer"
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
  // const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      reason: "",
      name: "",
      orgName: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    console.log("----data", data);
    // try {
    setIsSubmitting(true);

    //   const response = await sendEmail({
    //     ...data,
    //     businessEmail: data.email,
    //   });
    //   if (response.success) {
    //     setSubmitSuccess(true);
    reset();
    //   } else {
    //     console.error(response.errors || response.message);
    //   }
    //   setIsSubmitting(false);
    // } catch (error) {
    //   console.error("Error submitting form:", error);
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  return (
    <>
      <section className="relative h-[60vh] flex items-center justify-center">
        <div className=" absolute -top-80 space-y-9.5">
          <div className="bg-white border border-lightGray w-xl rounded-2xl p-10">
            <div className="flex flex-col items-center justify-center mb-10 text-dark text-center">
              <h2 className="font-bold text-2xl">{contactUsText.title}</h2>
              <p className="font-normal">{contactUsText.desc}</p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-3 mt-4 px-10"
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
                placeholder={contactUsText.referralDetails}
                {...register("message")}
                className="p-3 rounded-lg border border-lightGray resize-none"
              />

              <button
                type="submit"
                className="mx-auto h-12 w-52 mt-10 bg-dark text-white font-bold rounded-xl cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? contactUsText.contactUs : "שליחה"}
              </button>
            </form>
          </div>
          <ContactInfo />
        </div>
      </section>

      {/* Success Dialog */}
      <Dialog
        isOpen
        onClose={() => {}}
        modalClassName="w-[430px] py-16 overflow-hidden"
      >
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-dark">
            {contactUsText.messageSuccess}
          </h1>
          <p className="text-dark">{contactUsText.thankYou}</p>

          <Link
            href={"/"}
            className="bg-dark text-white rounded-2xl px-4 py-2.75 mt-6.5"
          >
            {contactUsText.backToMainPage}
          </Link>
        </div>
        <Image
          width={180}
          height={184}
          alt="Yellow Chrysanthemum"
          src={"/images/yellow-chrysanthemum.png"}
          className="absolute -left-16 -bottom-20"
        />
      </Dialog>
    </>
  );
};

export default ContactForm;
