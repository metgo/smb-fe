import { FaCircleCheck } from "react-icons/fa6";
import { buttonLabels, paymentPageLabels } from "@/constant/hebrew";
import { useVoucherStore } from "@/stores/voucherStore";

const VoucherIdInputField = ({
  error,
  handleCodeChange,
  voucherInputs,
  checkVoucher,
  addVoucherInput,
}: VoucherIdInputFieldProps) => {
  const { voucherDetails } = useVoucherStore();

  return (
    <div className="flex items-end gap-5">
      <div className="flex flex-col gap-4  max-sm:w-full">
        {voucherInputs?.map((input, index) => (
          <div key={index} className="gap-2">
            <div className="relative max-w-[450px] h-12 text-lg">
              <input
                type="text"
                placeholder="הזן מספר תו"
                value={input.code}
                className={`h-full max-md:w-full md:min-w-[450px] font-semibold peer border border-lightGray bg-transparent rounded-md px-3 py-2 focus:outline-none ${
                  error?.id === index && "border-secondary shake"
                }`}
                onChange={(e) => handleCodeChange(index, e.target.value)}
              />
              <div className="absolute top-1/2 left-0 -translate-y-1/2 h-full">
                {voucherDetails?.some((voucher) => voucher.id === input.id) ? (
                  <div className="mt-2 ml-1">
                    <FaCircleCheck size={30} color="green" />
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={!!!input?.code && input?.code?.length === 0}
                    onClick={() => checkVoucher(index)}
                    className={`
                      ${input?.code && input?.code?.length > 0 ? " custom-cursor" : "cursor-not-allowed bg-black/50"}
                      text-white bg-black py-[0.4rem] ml-[0.15rem] px-3 rounded-md font-bold w-full h-full
                    `}
                  >
                    {buttonLabels.approval}
                  </button>
                )}
              </div>
            </div>
            {error?.id === index && <p className="text-red-500">{error.msg}</p>}
          </div>
        ))}
      </div>
      {voucherDetails?.length === voucherInputs.length && (
        <button
          onClick={addVoucherInput}
          className="text-black underline hover:text-primary-dark font-bold"
        >
          {paymentPageLabels.addAnotherCharecter}
        </button>
      )}
    </div>
  );
};

export default VoucherIdInputField;
