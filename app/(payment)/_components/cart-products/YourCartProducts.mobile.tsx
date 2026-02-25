import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { pathNames } from "@/lib/endpoints";
import PriceTag from "@/components/PriceTag";
import useCartStore from "@/stores/cartStore";
import { cartLabels, paymentPageLabels } from "@/constant/hebrew";
import QtyIncrementDecrementBtns from "@/components/QtyIncrementDecrementBtns";
import { startLoading } from "@/components/wrappers/ProgressBar";
import useCheckoutStore from "@/stores/checkoutStore";
import { IoIosCloseCircle } from "react-icons/io";
import { BiCalendar } from "react-icons/bi";
import { GoClock } from "react-icons/go";

const MobileYourCartProducts = () => {
  const router = useRouter();
  const { cartItems, removeCartItem, getTotalPaidAmount, getTotalQuantity } =
    useCartStore();
  const { setPlaceOrderItems } = useCheckoutStore();

  function handleRedirectToCheckout() {
    startLoading();

    const orderPlaceItems = Object.values(
      cartItems.reduce(
        (acc, item) => {
          if (!acc[item._id]) {
            acc[item._id] = {
              _id: item._id,
              quantity: 0,
              itemType: item.itemType,
            };
          }
          acc[item._id].quantity += item.quantity;
          return acc;
        },
        {} as Record<
          string,
          { _id: string; quantity: number; itemType: string }
        >,
      ),
    );

    setPlaceOrderItems(orderPlaceItems);
    router.push(`${pathNames.checkout}?isCart=true`);
  }

  return (
    <div className="max-sm:block md:hidden mt-20 pt-8 ">
      <h1 className="font-bold text-3xl my-4">{cartLabels.myShoppingCart}</h1>

      <section className=" border border-secondary bg-white p-2 rounded-xl">
        <div className=" overscroll-auto">
          {cartItems?.map((item, index) => {
            const isThresholdQty = item?.quantity === 1;
            return (
              <div key={item?._id + index}>
                <div className="grid grid-cols-12 gap-2 items-center justify-between">
                  <div className="flex items-center w-full col-span-7 gap-2">
                    <div className="w-[80px] flex-shrink-0 h-[80px] bg-gray-200 relative rounded-md">
                      <Image
                        width={80}
                        height={80}
                        quality={100}
                        unoptimized
                        alt={item.name}
                        src={item.image}
                        className="rounded-lg object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex items-start flex-col font-normal">
                      <h3 className="line-clamp-1">{item.name}</h3>
                      {item?.eventDate && item?.startTime && item?.endTime && (
                        <div className="text-xs text-gray-800 mt-1 font-normal">
                          <div className="flex gap-1 items-center">
                            <BiCalendar /> {item?.eventDate}&nbsp;&nbsp;
                          </div>
                          <div className="flex gap-1 items-center">
                            <GoClock />
                            <span>
                              {item?.startTime} – {item?.endTime}
                            </span>{" "}
                          </div>
                        </div>
                      )}
                      <PriceTag
                        price={item?.price}
                        className=" col-span-2 text-end mad:hidden max-ms:block"
                      />
                    </div>
                  </div>

                  <div className="col-span-4">
                    <QtyIncrementDecrementBtns
                      item={item}
                      quantity={item.quantity}
                      isThresholdQty={isThresholdQty}
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <IoIosCloseCircle
                      size={30}
                      className="cursor-pointer"
                      onClick={() => removeCartItem(item)}
                    />
                  </div>
                </div>
                {index < cartItems.length - 1 && (
                  <div className="border-b my-2.5 border-lightGray" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex items-center justify-center flex-col gap-6.25 mt-4">
        <div className="bg-primary flex items-center justify-between px-4 py-3 w-full rounded-md">
          <span className="font-bold">{paymentPageLabels.totalPaid}</span>
          <PriceTag price={getTotalPaidAmount()} />
        </div>
        <button
          onClick={handleRedirectToCheckout}
          disabled={getTotalQuantity() < 1}
          className={clsx(
            "font-bold text-white rounded-xl py-2.5 px-10",
            getTotalQuantity() > 0
              ? "custom-cursor bg-black"
              : "cursor-not-allowed bg-black/40",
          )}
        >
          {cartLabels.proceedToSecurePayment}
        </button>
      </div>
    </div>
  );
};

export default MobileYourCartProducts;
