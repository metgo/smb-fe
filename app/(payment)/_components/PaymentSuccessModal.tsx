import Image from "next/image";
import { useRouter } from "next/navigation";

import { Dialog } from "@/components/ui";
import { pathNames } from "@/lib/endpoints";
import { buttonLabels, paymentPageLabels } from "@/constant/hebrew";
import { startLoading } from "@/components/wrappers/ProgressBar";

const PaymentSuccessModal = ({ isOpen }: PaymentSuccessFailureModalProps) => {
  const router = useRouter();

  function handleClose() {
    startLoading();
    router.push(pathNames.businesses);
  }
  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      className="max-h-[85vh] max-w-[660px] w-full overflow-hidden no-scrollbar"
    >
      <div className="flex w-full flex-col gap-4 items-center p-10 relative">
        <div className="flex flex-col gap-4 items-center px-10">
          <h2 className="text-[38px] text-black font-bold">
            {paymentPageLabels.yourGiftIsOnItsWay}
          </h2>
          <p className="text-[16px] text-center text-black font-normal max-w-[380px]">
            {paymentPageLabels.paymentSuccessMessage}
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="px-8 min-h-[48px] mt-[12px] bg-black text-white rounded-xl cursor-pointer hover:shadow-md"
          >
            {buttonLabels.continueShopping}
          </button>
          {/* <span className="text-[16px] text-black font-bold">
            {paymentPageLabels.toMyPersonalArea}
          </span> */}
        </div>
        <Image
          width={180}
          height={184}
          alt="Yellow Chrysanthemum"
          src="/images/yellow-chrysanthemum.png"
          className="absolute -left-16 -bottom-20 w-44"
        />
      </div>
    </Dialog>
  );
};

export default PaymentSuccessModal;
