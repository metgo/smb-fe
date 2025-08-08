import Image from "next/image";
import { useState } from "react";

import { paymentPageLabels } from "@/constant/hebrew";
import VoucherIdInputField from "./VoucherIdInputField";

const isLoading = false;
const remainingAmount = 12;

const PaymentInfo = ({ handleToggle, thirdInfo }: PaymentInfoProps) => {
  const [voucherInputs, setVoucherInputs] = useState<
    { code: string; id?: string }[]
  >([{ code: "" }]);

  function handleCodeChange(index: number, newCode: string) {
    setVoucherInputs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], code: newCode };
      return updated;
    });
  }

  function checkVoucher() {}
  function addVoucherInput() {}

  return (
    <div className="bg-white p-4 max-sm:mx-3 max-sm:mb-20 rounded-md flex flex-col gap-4 shadow">
      <div
        onClick={() => handleToggle("third")}
        className="flex justify-between cursor-pointer"
      >
        <div
          className={`font-bold text-[16px] ${thirdInfo ? "text-black" : "text-darkPrimary"}`}
        >
          3. {paymentPageLabels.choosingPaymentMethod}
        </div>
      </div>
      {thirdInfo && (
        <div className="flex flex-col gap-3">
          <div className="text-[16px] font-bold text-black">יש לי תו</div>
          <VoucherIdInputField
            error={{ id: 0, msg: "" }}
            handleCodeChange={handleCodeChange}
            voucherInputs={voucherInputs}
            checkVoucher={checkVoucher}
            addVoucherInput={addVoucherInput}
          />

          {remainingAmount > 0 ? (
            <>
              <span className="border-b border-lightgray" />
              <div className="flex flex-col gap-3">
                <div className="text-[16px] font-bold text-black">
                  {paymentPageLabels.orChooseAnotherPaymentMethod}
                </div>
                <div className="flex gap-3 items-center flex-wrap">
                  <div
                    // onClick={
                    //   !isLoading
                    //     ? () => {
                    //       handelOrders();
                    //       setSelectMethod("card");
                    //     }
                    //     : undefined
                    // }
                    className={`cursor-pointer flex gap-3 items-center justify-between border-[1px] border-lightgray rounded-md px-3 py-3 ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Image
                      className="w-10 h-8"
                      width={30}
                      height={30}
                      src={""}
                      alt="card"
                    />
                    <div className="text-[14px] font-semibold text-black">
                      {paymentPageLabels.creditCard}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-end">
              <button>{"אישור הזמנה"}</button>
            </div>
          )}
        </div>
      )}

      {/* {paymentUrl && (
        <PaymentModal isOpen={isOpen} onClose={handleClose}>
          <iframe
            onLoad={handleIframeLoad}
            src={paymentUrl}
            className="min-w-full  rounded-md min-h-[80vh]"
          />
        </PaymentModal>
      )} */}
    </div>
  );
};

export default PaymentInfo;
