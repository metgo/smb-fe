import Image from "next/image";
import { IoMdClose } from "react-icons/io";
import { useRouter } from "next/navigation";

import PriceTag from "../PriceTag";
import EmptyCart from "../EmptyCart";
import { MotionDialogDiv } from "../ui";
import { pathNames } from "@/lib/endpoints";
import useCartStore from "@/stores/cartStore";
import { cartLabels, paymentPageLabels } from "@/constant/hebrew";
import QtyIncrementDecrementBtns from "../QtyIncrementDecrementBtns";
import { startLoading } from "../wrappers/ProgressBar";
import useCheckoutStore from "@/stores/checkoutStore";

interface CartDrawerProps {
  setIsOpen: (isOpen: boolean) => void;
}

const CartDrawer = ({ setIsOpen }: CartDrawerProps) => {
  const router = useRouter();
  const { setPlaceOrderItems } = useCheckoutStore();
  const { cartItems, removeCartItem, getTotalPaidAmount } = useCartStore();

  function onClose() {
    setIsOpen(false);
  }

  function handleNavigation(isCart: boolean = true) {
    startLoading();
    setIsOpen(false);
    if (isCart) {
      router.push(`${pathNames.cart}`);
    } else {
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
  }

  return (
    <div
      className="fixed hide-scrollbar inset-0 bg-black/40  sm:flex items-center justify-center max-sm:p-0 p-4 z-[999]"
      onClick={onClose}
    >
      <MotionDialogDiv
        type="drawer-left"
        className="fixed z-50 top-0 left-0 h-full max-sm:w-full w-[395px] rounded-lg bg-white shadow-xl max-sm:pb-5  px-5 py-7.5 max-sm:bottom-0 max-sm:rounded-t-lg overflow-y-auto dialog-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div
            className="absolute cursor-pointer top-[20px] left-[20px] z-50 w-10 h-10 flex items-center justify-center rounded-full bg-primary"
            onClick={onClose}
          >
            <IoMdClose size={24} />
          </div>
          <h2 className="font-bold text-2xl">{cartLabels.myShoppingCart}</h2>
        </div>

        <section className="mt-4">
          {cartItems?.length > 0 ? (
            <div>
              <div className="min-h-[69vh] overscroll-auto">
                {cartItems?.map((item, index) => {
                  const isThresholdQty = item.quantity === 1;
                  return (
                    <div key={item._id + index}>
                      <div className="flex gap-4 items-center justify-between">
                        <div className="flex gap-4 items-center w-full">
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
                            <h3 className=" font-normal line-clamp-1">
                              {item.name}
                            </h3>
                            <PriceTag
                              price={item?.price}
                              className=" text-sm font-normal"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 items-center justify-between">
                          <QtyIncrementDecrementBtns
                            item={item}
                            quantity={item.quantity}
                            isThresholdQty={isThresholdQty}
                          />
                          <div
                            onClick={() => removeCartItem(item)}
                            className="cursor-pointer size-[16px] bg-black rounded-full flex items-center justify-center text-white p-[1px] font-bold"
                          >
                            <IoMdClose />
                          </div>
                        </div>
                      </div>
                      {index < cartItems.length - 1 && (
                        <div className="border-b my-2.5 border-lightGray" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center flex-col">
                <div className="bg-primary flex items-center justify-between px-4 py-3 w-full">
                  <span className="font-bold">
                    {paymentPageLabels.totalPaid}
                  </span>
                  <PriceTag price={getTotalPaidAmount()} />
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigation(false)}
                  className="font-bold text-white bg-black rounded-md py-2.5 px-16 cursor-pointer mt-6 mb-4"
                >
                  {cartLabels.proceedToSecurePayment}
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigation(true)}
                  className="font-bold underline cursor-pointer"
                >
                  {cartLabels.toViewMyShoppingCart}
                </button>
              </div>
            </div>
          ) : (
            <EmptyCart />
          )}
        </section>
      </MotionDialogDiv>
    </div>
  );
};

export default CartDrawer;
