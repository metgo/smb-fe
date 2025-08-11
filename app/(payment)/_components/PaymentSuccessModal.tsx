import { useRouter } from "next/navigation";

import { Dialog } from "@/components/ui";
import { buttonLabels, paymentPageLabels } from "@/constant/hebrew";

const PaymentSuccessModal = ({
  isOpen,
  onClose,
}: PaymentSuccessFailureModalProps) => {
  const router = useRouter();

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[85vh] max-w-[660px] h-[60vh] w-full overflow-hidden no-scrollbar"
    >
      <div className="flex w-full flex-col gap-4 items-center pt-10">
        <div className="flex flex-col gap-4 items-center px-10">
          <h2 className="text-[38px] text-black font-bold">
            {paymentPageLabels.yourGiftIsOnItsWay}
          </h2>
          <p className="text-[16px] text-center text-black font-normal max-w-[380px]">
            {paymentPageLabels.paymentSuccessMessage}
          </p>
          <button
            type="button"
            onClick={() => router.back()}
            className="min-w-[225px] max-sm:w-full min-h-[48px] mt-[12px] bg-black text-white rounded-md"
          >
            {buttonLabels.continueShopping}
          </button>
          <span className="text-[16px] text-black font-bold">
            {paymentPageLabels.toMyPersonalArea}
          </span>
        </div>
        <div className="w-full rounded-b-[20px] overflow-hidden">
          <div className="relative max-h-[19.59rem] w-full z-[999] max-sm:mt-16 rounded-b-[20px]">
            {/* <Image
              className="w-full hidden md:block rounded-b-[20px] object-cover"
              src={images.successFooter}
              width={1275}
              height={412}
              alt="success"
            />
            <Image
              className="w-full md:hidden rounded-b-[20px] object-cover"
              src={images.mobileSuccess}
              width={1275}
              height={412}
              alt="success"
            /> */}
            <div className="w-full absolute max-sm:-top-10 top-8">
              <div className="h-px sm:w-[60%] sm:absolute sm:right-[16%] w-[80%] z-[1] bg-lightgray mx-auto" />
              <div className="flex mt-2 items-center justify-center gap-2 flex-col">
                <p className="font-semibold text-sm text-center -mr-5">
                  {paymentPageLabels.shareAndHelpStrengthLocalBusiness}
                </p>
                <div className="flex gap-2 -mr-5">
                  {/* {socialIcons.map((image, index) => (
                    <Link key={index} href={image.link} target="_blank">
                      <Image
                        quality={100}
                        src={image.image}
                        className="ring-1 ring-lightgray rounded-full"
                        alt={image.alt}
                        width={40}
                        height={40}
                      />
                    </Link>
                  ))} */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default PaymentSuccessModal;
