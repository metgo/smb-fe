import { Suspense } from "react";

import { paymentPageLabels } from "@/constant/hebrew";
import PaymentSections from "../_components/PaymentSections";
import {
  getProductDetailsById,
  postProductToCart,
} from "@/actions/productActions";

const page = async ({ searchParams }: SearchParamsProps | any) => {
  const productId = searchParams.productId;

  const cartDetails = await postProductToCart(productId as string);
  const productDetails = await getProductDetailsById(productId as string);

  return (
    <Suspense fallback={<div></div>}>
      <div className="container mx-auto py-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[28px] max-sm:mr-4 text-black font-extrabold">
            {paymentPageLabels.justMomentWerDone}
          </h1>

          <PaymentSections
            cartDetails={cartDetails}
            productDetails={productDetails}
          />
        </div>
      </div>
    </Suspense>
  );
};

export default page;
