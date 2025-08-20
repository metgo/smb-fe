import clsx from "clsx";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";
import { useRouter } from "next/navigation";

import { pathNames } from "@/lib/endpoints";
import PriceTag from "@/components/PriceTag";
import useCartStore from "@/stores/cartStore";
import { cartLabels, paymentPageLabels } from "@/constant/hebrew";
import QtyIncrementDecrementBtns from "@/components/QtyIncrementDecrementBtns";

const YourCartProducts = () => {
  const router = useRouter();
  const {
    cartProducts,
    removeCartProduct,
    getTotalPaidAmount,
    getTotalQuantity,
  } = useCartStore();

  function handleRedirectToCheckout() {
    router.push(
      `${pathNames.checkout}?isCart=true&productId=${cartProducts.map((item) => item._id).join(",")}`,
    );
  }

  return (
    <div>
      <h1 className="font-bold text-2xl mb-4">{cartLabels.myShoppingCart}</h1>
      <div className="grid grid-cols-12 gap-4">
        <section className="col-span-8 border border-secondary bg-white p-4 rounded-xl">
          <div className=" overscroll-auto">
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
                        <h3 className="line-clamp-1 font-bold">
                          {product.name}
                        </h3>
                        <div
                          className="line-clamp-2 font-normal w-1/2 text-[12px] text-theme"
                          dangerouslySetInnerHTML={{ __html: product.desc }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-12 items-center justify-between">
                      <QtyIncrementDecrementBtns
                        _id={product._id}
                        quantity={product.quantity}
                        isThresholdQty={isThresholdQty}
                      />
                      <PriceTag
                        price={product?.price}
                        className=" text-2xl font-normal"
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
                  ? "cursor-pointer bg-black"
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
