import Image from "next/image";

import PriceTag from "@/components/PriceTag";
import { paymentPageLabels } from "@/constant/hebrew";
import useCheckoutStore from "@/stores/checkoutStore";
import { useVoucherStore } from "@/stores/voucherStore";
import { IconImage } from "@/components/ui";

const ProductInfo = () => {
  const { orderProducts, totalDeliveryFee } = useCheckoutStore();
  const { voucherDetails, removeVoucher } = useVoucherStore();

  const totalProductCost = orderProducts.reduce(
    (sum, item) => sum + item.price * (item?.quantity || 1),
    0,
  );

  const totalVoucherDiscount = voucherDetails.reduce(
    (sum, item) => sum + (item?.remainingAmount || 0),
    0,
  );

  const totalAmount = Math.max(
    0,
    totalProductCost - totalVoucherDiscount + totalDeliveryFee,
  );

  return (
    <div
      className={`col-span-4 flex flex-col justify-between bg-white p-4 max-sm:rounded-none rounded-md max-w shadow`}
    >
      <section className="flex items-center justify-between flex-col h-full ">
        <div className=" w-full">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <h2 className="text-2xl font-bold mb-4">
                {paymentPageLabels.orderSummary}
              </h2>
            </div>
          </div>
          <div>
            {orderProducts?.map((item) => (
              <div key={item._id}>
                <div className="flex gap-2 items-center justify-between">
                  <Image
                    width={100}
                    height={100}
                    alt={item.alt}
                    src={item.image}
                    className="rounded w-[60px] h-[50px] "
                  />
                  <div className="md:w-60 font-bold">{item.name}</div>
                  <div>
                    <span className="font-bold">{item.quantity}x</span>
                    <PriceTag price={item.price} className="font-bold ml-1" />
                  </div>
                </div>
                <div className="w-full h-[1px] bg-secondary my-1" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        className={`flex flex-col gap-4 ${true ? "block" : "hidden md:block"}`}
      >
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center relative">
            <div className="rounded-md w-12  h-12 border-[1.5px] flex items-center justify-center">
              <IconImage width={38} height={38} icon={"delivery-truck"} />
            </div>
            <span className="text-[14px] font-bold text-black">
              {paymentPageLabels.shippingPrice}
            </span>
          </div>
          <PriceTag
            price={totalDeliveryFee}
            className="text-[14px] font-semibold text-black"
          />
        </div>

        {voucherDetails?.map((voucher) => (
          <div
            key={voucher.code}
            className="flex justify-between items-center border-b border-lightgray py-2"
          >
            <div className="flex gap-2 items-center relative">
              {/* <NextImage
                width={24}
                height={24}
                isOptimized
                className="w-12 h-12"
                alt={voucher.name || "שובר"}
                imgSrc={images.voucherFlower}
              /> */}
              <span className="text-[14px] font-bold text-black">
                {voucher.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <PriceTag
                price={voucher.remainingAmount}
                className="text-[14px] font-semibold text-black"
              />
              <button
                onClick={() => removeVoucher(voucher.code)}
                className="text-secondary hover:text-red-700 text-[24px] font-bold cursor-pointer"
                aria-label={`הסר שובר ${voucher.name}`}
              >
                ×
              </button>
            </div>
          </div>
        ))}
        <div className="bg-lightPrimary rounded-md py-4 hidden sm:flex">
          <div className="flex justify-between w-full text-[18px] font-bold text-black">
            <span>{paymentPageLabels.totalPaid}</span>
            <PriceTag price={totalAmount} noStyle />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductInfo;
