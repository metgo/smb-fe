import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Dialog } from "@/components/ui";
import { pathNames } from "@/lib/endpoints";
import { buttonLabels, paymentPageLabels } from "@/constant/hebrew";
import { startLoading } from "@/components/wrappers/ProgressBar";

const PaymentFailureModal = ({ isOpen }: PaymentSuccessFailureModalProps) => {
  const router = useRouter();

  function handleClose() {
    startLoading();
    router.push(pathNames.businesses);
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      className="max-h-[85vh] max-w-[660px] w-full  overflow-hidden no-scrollbar relative p-20"
    >
      <div className="flex w-full flex-col gap-4 items-center relative">
        <div className="flex flex-col gap-4 items-center px-10">
          <h2 className="text-[38px] text-black font-bold">
            {paymentPageLabels.oopsSeemToHaveAProblem}
          </h2>
          <p className="text-[16px] text-center text-black w-full font-normal text-3xl">
            {paymentPageLabels.paymentFailureMessage}
          </p>
          <Link
            href={pathNames.businesses}
            className="bg-black rounded-md text-white py-3 px-8 mt-6 hover:shadow-md"
          >
            {buttonLabels.continueShopping}
          </Link>
        </div>
        <Image
          width={180}
          height={184}
          alt="Yellow Chrysanthemum"
          src="/images/yellow-chrysanthemum.png"
          className="absolute -left-44 -bottom-48 w-60"
        />
      </div>
    </Dialog>
  );
};

export default PaymentFailureModal;
