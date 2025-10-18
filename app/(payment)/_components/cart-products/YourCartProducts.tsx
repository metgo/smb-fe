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

const YourCartProducts = () => {
  const router = useRouter();
  const { cartItems, removeCartItem, getTotalPaidAmount, getTotalQuantity } =
    useCartStore();
  console.log("🚀 ~ YourCartProducts ~ cartItems:", cartItems);
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
    <div className="max-sm:hidden md:block">
      <h1 className="font-bold text-2xl mb-4">{cartLabels.myShoppingCart}</h1>
      <div className="grid grid-cols-12 gap-4">
        <section className="col-span-8 border border-secondary bg-white p-4 rounded-xl">
          <div className=" overscroll-auto">
            {cartItems?.map((item, index) => {
              const isThresholdQty = item.quantity === 1;
              return (
                <div key={item._id + index}>
                  <div className="grid grid-cols-18 items-center justify-between">
                    <div className="flex gap-4 items-center w-full col-span-11">
                      <div className="w-[60px] flex-shrink-0 h-[60px] bg-gray-200 relative rounded-md">
                        <Image
                          width={60}
                          height={60}
                          quality={100}
                          unoptimized
                          alt={item.name}
                          src={item.image}
                          className="rounded-lg object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex justify-start w-full flex-col">
                        <div className="flex items-center gap-2 ">
                          <h3 className="line-clamp-1 font-bold">
                            {item.name}
                          </h3>
                          {item?.eventDate && (
                            <span className="font-normal">
                              {" "}
                              - {item.eventDate}
                            </span>
                          )}
                        </div>
                        <div
                          className="line-clamp-2 font-normal w-1/2 text-[12px] text-theme"
                          dangerouslySetInnerHTML={{ __html: item.desc }}
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
                    <PriceTag
                      price={item?.price}
                      className=" text-2xl font-normal col-span-2 text-end"
                    />
                    <div className="col-span-1 flex items-center justify-end">
                      <IoIosCloseCircle
                        size={24}
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

        <section className="col-span-4 bg-white border border-secondary rounded-xl p-4 h-max">
          <div className="font-bold text-2xl">
            {paymentPageLabels.orderSummary}
          </div>
          <div className="flex items-center justify-center flex-col gap-6.25 mt-4">
            <div className="bg-primary flex items-center justify-between px-4 py-3 w-full rounded-md">
              <span className="font-bold">{paymentPageLabels.totalPaid}</span>
              <PriceTag price={getTotalPaidAmount()} />
            </div>
            <button
              onClick={handleRedirectToCheckout}
              disabled={getTotalQuantity() < 1}
              className={clsx(
                "font-bold text-white rounded-md py-2.5 px-16",
                getTotalQuantity() > 0
                  ? "custom-cursor bg-black"
                  : "cursor-not-allowed bg-black/40",
              )}
            >
              {cartLabels.proceedToSecurePayment}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default YourCartProducts;
