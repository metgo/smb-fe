import { Suspense } from "react";

import { paymentPageLabels } from "@/constant/hebrew";
import PaymentSections from "../_components/PaymentSections";
import {
  getProductDetailsByIds,
  postProductToCart,
} from "@/actions/productActions";

const page = async ({ searchParams }: SearchParamsProps | any) => {
  const productIdParam = searchParams.productId;
  const isCart = searchParams?.isCart || false;
  const productIds = productIdParam.split(",");
  const cartDetails = await postProductToCart(productIds[0] as string);
  const productDetails = await getProductDetailsByIds(productIds);

  return (
    <Suspense fallback={<div></div>}>
      <div className="container mx-auto py-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[28px] max-sm:mr-4 text-black font-extrabold">
            {paymentPageLabels.justMomentWerDone}
          </h1>

          <PaymentSections
            isCart={isCart}
            cartDetails={cartDetails}
            productDetailsList={productDetails}
          />
        </div>
      </div>
    </Suspense>
  );
};

export default page;
