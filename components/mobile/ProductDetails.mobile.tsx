import PriceTag from "../PriceTag";
import { misc } from "@/constant/hebrew";
import { sanitizeHtml } from "@/lib/helpers";
import { AddToCartBuyNowBtns } from "@/app/(details)/_components";
import MobileImageGallery from "./ImageGallery.mobile";
import MobileProductList from "./ProductList.mobile";
import MobileDeliveriesContent from "./DeliveriesContent.mobile ";
import MobileActionIcons from "./ActionIcons.mobile";

interface MobileProductDetailsProps {
  productDetails: ProductDetailsProps;
  relatedProducts: Product[];
  // attributes: Attributes[]
}

const MobileProductDetails = ({
  productDetails,
  relatedProducts,
}: MobileProductDetailsProps) => {
  return (
    <div className="md:hidden max-sm:block pt-6">
      <MobileActionIcons />
      <section className="mb-15 px-8">
        <h1 className="font-bold text-6xl mb-4">{productDetails?.name}</h1>
        <div
          className="font-normal text-2xl text-theme"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(productDetails?.description || ""),
          }}
        />
        <PriceTag
          price={productDetails?.price?.sellingPrice}
          className="text-[32px] text-dark font-normal my-2.5"
        />
        <AddToCartBuyNowBtns product={productDetails} />
      </section>
      <MobileImageGallery images={productDetails.images} />

      {/* <AttributePills items={attributes} /> */}
      {relatedProducts?.length > 0 && (
        <>
          <div className="text-2xl font-bold my-10 text-center">
            {misc.mayInterestYou}
          </div>
          <MobileProductList
            products={relatedProducts}
            primaryCategoryId={""}
          />
        </>
      )}

      <MobileDeliveriesContent {...productDetails} />
    </div>
  );
};

export default MobileProductDetails;
