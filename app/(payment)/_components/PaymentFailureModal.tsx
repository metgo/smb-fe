import { useRouter } from "next/navigation";

import { Dialog } from "@/components/ui";
import { buttonLabels, paymentPageLabels } from "@/constant/hebrew";

const PaymentFailureModal = ({
  isOpen,
  onClose,
}: PaymentSuccessFailureModalProps) => {
  const router = useRouter();

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[85vh] max-w-[660px] h-[60vh] w-full  overflow-hidden no-scrollbar relative"
    >
      <div className="flex w-full flex-col gap-4 items-center pt-10">
        <div className="flex flex-col gap-4 items-center px-10">
          <h2 className="text-[38px] text-black font-bold">
            {paymentPageLabels.oopsSeemToHaveAProblem}
          </h2>
          <p className="text-[16px] text-center text-black w-full font-normal text-3xl">
            {paymentPageLabels.paymentFailureMessage}
          </p>
          <button
            type="button"
            onClick={() => router.back()}
            className="min-w-[225px] mt-[38px] bg-black rounded-md text-white py-3"
          >
            {buttonLabels.continueShopping}
          </button>
        </div>
        <div className="w-full relative rounded-b-[20px] overflow-hidden">
          <div className="max-h-[18rem] w-full rounded-b-[20px]">
            {/* <Image
              className="w-full rounded-b-[20px] object-cover"
              src={images.successFooter}
              alt="failure"
              fill
            /> */}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default PaymentFailureModal;
