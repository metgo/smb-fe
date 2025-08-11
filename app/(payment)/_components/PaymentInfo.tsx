import { paymentPageLabels } from "@/constant/hebrew";
import VoucherIdInputField from "./VoucherIdInputField";
import { IconImage } from "@/components/ui";
import PaymentModal from "./PaymentModal";
import { usePayment } from "@/hooks/usePayment";
import useCheckoutStore from "@/stores/checkoutStore";

const PaymentInfo = ({ handleToggle, thirdInfo }: PaymentInfoProps) => {
  const {
    isLoading,
    handelPlaceOrder,
    handleIframeLoad,
    paymentUrl,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    setSelectMethod,
    addVoucherInput,
    checkVoucher,
    handleCodeChange,
    voucherInputs,
    remainingAmount,
  } = usePayment();
  const { isStepOneSubmitBtnDisabled, isStepTwoSubmitBtnDisabled } =
    useCheckoutStore();

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
              <span className="border-b border-black/20" />
              <div className="flex flex-col gap-3">
                <div className="text-[16px] font-bold text-black">
                  {paymentPageLabels.orChooseAnotherPaymentMethod}
                </div>
                <div className="flex gap-3 items-center flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      handelPlaceOrder();
                      setSelectMethod("card");
                    }}
                    disabled={
                      isStepOneSubmitBtnDisabled ||
                      isStepTwoSubmitBtnDisabled ||
                      isLoading
                    }
                    className={`flex gap-3 items-center justify-between border-[1px] border-lightgray rounded-md px-3 py-3 ${
                      isLoading ||
                      isStepOneSubmitBtnDisabled ||
                      isStepTwoSubmitBtnDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <IconImage icon="credit-card.png" hasExtension />
                    <span className="text-[14px] font-semibold text-black">
                      {paymentPageLabels.creditCard}
                    </span>
                  </button>
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

      {paymentUrl && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
        >
          <iframe
            onLoad={handleIframeLoad}
            src={paymentUrl}
            className="min-w-full  rounded-md min-h-[80vh]"
          />
        </PaymentModal>
      )}
    </div>
  );
};

export default PaymentInfo;
