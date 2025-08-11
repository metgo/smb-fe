import { paymentPageLabels } from "@/constant/hebrew";
import PaymentSections from "../_components/PaymentSections";
import {
  getProductDetailsById,
  postProductToCart,
} from "@/actions/productActions";

interface CheckoutPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const page = async ({ searchParams }: CheckoutPageProps) => {
  const productId = searchParams.productId;

  const cartDetails = await postProductToCart(productId as string);
  const productDetails = await getProductDetailsById(productId as string);

  return (
    <div className="container mx-auto py-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-[28px] max-sm:mr-4 text-black font-extrabold">
          {paymentPageLabels.justMomentWerDone}
        </h1>

        <PaymentSections
          cartDetails={cartDetails}
          productDetails={productDetails}
        />
        {/* <PaymentSuccessModal
          onClose={handleClose}
          isOpen={orderStatus === "success"}
        />
        <PaymentFailureModal
          onClose={handleClose}
          isOpen={orderStatus === "failure"}
        /> */}
      </div>
    </div>
  );
};

export default page;
