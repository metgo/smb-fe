import { paymentPageLabels } from "@/constant/hebrew";
import PaymentSections from "../_components/PaymentSections";

const page = async () => {
  return (
    <div className="container mx-auto py-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-[28px] max-sm:mr-4 max-sm:mt-20 text-black font-extrabold">
          {paymentPageLabels.justMomentWerDone}
        </h1>

        <PaymentSections />
      </div>
    </div>
  );
};

export default page;
