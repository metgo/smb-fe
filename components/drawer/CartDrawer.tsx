import Image from "next/image";
import { IoMdClose } from "react-icons/io";

import PriceTag from "../PriceTag";
import { MotionDialogDiv } from "../ui";
import useCartStore from "@/stores/cartStore";
import { cartLabels, paymentPageLabels } from "@/constant/hebrew";
import Link from "next/link";
import QtyIncrementDecrementBtns from "../QtyIncrementDecrementBtns";

interface CartDrawerProps {
  setIsOpen: (isOpen: boolean) => void;
}

const CartDrawer = ({ setIsOpen }: CartDrawerProps) => {
  const { cartProducts, removeCartProduct, getTotalPaidAmount } =
    useCartStore();

  function onClose() {
    setIsOpen(false);
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
          {cartProducts?.length > 0 ? (
            <div>
              <div className="min-h-[69vh] overscroll-auto">
                {cartProducts?.map((product, index) => {
                  const isThresholdQty = product.quantity === 1;
                  return (
                    <div key={product._id}>
                      <div className="flex gap-4 items-center justify-between">
                        <div className="flex gap-4 items-center w-full">
                          <div className="w-[60px] flex-shrink-0 h-[60px] bg-gray-200 relative rounded-md">
                            <Image
                              width={60}
                              height={60}
                              quality={100}
                              unoptimized
                              alt={product.name}
                              src={product.image}
                              className="rounded-lg object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex justify-start w-full flex-col">
                            <h3 className=" font-normal line-clamp-1">
                              {product.name}
                            </h3>
                            <PriceTag
                              price={product?.price}
                              className=" text-sm font-normal"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 items-center justify-between">
                          <QtyIncrementDecrementBtns
                            _id={product._id}
                            quantity={product.quantity}
                            isThresholdQty={isThresholdQty}
                          />
                          <div
                            onClick={() => removeCartProduct(product._id)}
                            className="cursor-pointer size-[16px] bg-black rounded-full flex items-center justify-center text-white p-[1px] font-bold"
                          >
                            <IoMdClose />
                          </div>
                        </div>
                      </div>
                      {index < cartProducts.length - 1 && (
                        <div className="border-b my-2.5 border-lightGray" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center flex-col gap-6.25">
                <div className="bg-primary flex items-center justify-between px-4 py-3 w-full">
                  <span className="font-bold">
                    {paymentPageLabels.totalPaid}
                  </span>
                  <PriceTag price={getTotalPaidAmount()} />
                </div>
                <Link
                  href={`/check-out?isCart=true&productId=${cartProducts.map((item) => item._id).join(",")}`}
                  className="font-bold text-white bg-black rounded-md py-2.5 px-16 cursor-pointer"
                >
                  {cartLabels.proceedToSecurePayment}
                </Link>
                <Link href={`/cart`} className="font-bold underline">
                  {cartLabels.toViewMyShoppingCart}
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-col gap-3 h-[80vh] w-full">
              <h3 className="text-2xl font-bold">
                {cartLabels.yourCartIsEmptyYet}
              </h3>
              <p className="max-w-60 text-center font-normal">
                {cartLabels.emptyCartText}
              </p>
              <button
                type="button"
                className="font-bold text-white bg-black rounded-md py-2.5 px-16 cursor-pointer"
              >
                {cartLabels.toViewProduct}
              </button>
            </div>
          )}
        </section>
      </MotionDialogDiv>
    </div>
  );
};

export default CartDrawer;
