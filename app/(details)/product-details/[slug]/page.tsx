"use client";
import { getProductDetailsBySlug } from "@/actions/productActions";
import { sanitizeHtml } from "@/lib/helpers";
import { NoDetailsFound, ProductDetailsFilterTab } from "../../_components";
import {
  ProductGallery,
  ProductInfoCards,
  ProductQtyBtns,
  RelatedProductsSection,
} from "../_components";
import { Copy, Share2 } from "lucide-react";
import { sendGAEvent } from "@/lib/analytics";
import { triggerName } from "@/lib/googleEventsConfig";

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (!slug || slug === "undefined") return <NoDetailsFound />;

  const productDetails: ProductDetailsProps =
    await getProductDetailsBySlug(slug);

  if (!productDetails) return <NoDetailsFound />;

  const {
    name,
    description,
    images,
    price,
    quantity,
    deliveryArea,
    openingHrs,
    deliverySpecificSellerInfo,
    deliveryReturnExchange,
    deliveryAdditionalInfo,
    businessId,
    accessibilitiesId,
  } = productDetails;

  const firstDeliveryPrice = deliveryArea?.[0]?.price;
  const isFreeDelivery = firstDeliveryPrice === "0";

 

  return (
    <div
      className="min-h-screen transition-colors duration-300 bg-gray-50"
      dir="rtl"
    >
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-3 pt-40 md:pt-8 flex items-end justify-end">
        <button
          className="p-2.5 sm:p-3 rounded-2xl shadow-md hover:shadow-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center bg-white"
        >
          <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
        </button>
        <button
          className="p-2.5 sm:p-3 rounded-2xl shadow-md hover:shadow-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center bg-white"
        >
          <Copy className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
        </button>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-40 md:pt-10">
        {/* HERO SECTION — name, price, gallery */}
        <div className="rounded-3xl shadow-lg overflow-hidden mb-8 bg-white">
          <div className="relative p-8 pb-6">
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">
                  {name}
                </h1>
                <div
                  className="text-lg text-gray-600 mb-4"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(description),
                  }}
                />

                {/* Price */}
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-4xl font-bold text-teal-600">
                    ₪{price.sellingPrice}
                  </span>

                  {price.markedPrice > price.sellingPrice && (
                    <span className="text-xl text-gray-400 line-through">
                      ₪{price.markedPrice}
                    </span>
                  )}

                  {deliveryArea?.length > 0 && (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl text-gray-400">+</span>
                      <span
                        className={`text-2xl font-bold ${
                          isFreeDelivery ? "text-teal-600" : "text-orange-600"
                        }`}
                      >
                        {isFreeDelivery
                          ? "משלוח חינם"
                          : `₪${firstDeliveryPrice}`}
                      </span>
                      <span className="text-sm text-gray-500">משלוח</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Gallery */}
          <ProductGallery images={images} name={name} />
        </div>

        <ProductQtyBtns product={productDetails} />
        {productDetails.description && (
          <div className="rounded-3xl shadow-lg bg-white mb-8 p-6 lg:p-8">
            <div className="text-2xl font-bold">תיאור מלא</div>
            <div
              className="font-normal"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(description || ""),
              }}
            />{" "}
          </div>
        )}

        {/* INFO CARDS + DESCRIPTION/DELIVERY TABS */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Info Cards — 1/4 */}
          <div className="lg:w-1/4">
            <ProductInfoCards
              deliveryArea={deliveryArea}
              businessId={businessId}
              quantity={quantity}
              // openingHrs={openingHrs}
            />
          </div>

          {/* Description + Delivery Tabs — 3/4 */}
          <div className="rounded-3xl shadow-lg p-6 sm:p-8 lg:w-3/4 bg-white">
            <ProductDetailsFilterTab
              _id={productDetails._id}
              name={name}
              dmoId={productDetails.dmoId}
              description={description}
              images={images}
              price={price}
              quantity={quantity}
              businessId={productDetails.businessId}
              openingHrs={openingHrs}
              deliveryArea={deliveryArea}
              deliverySpecificSellerInfo={deliverySpecificSellerInfo}
              deliveryReturnExchange={deliveryReturnExchange}
              deliveryAdditionalInfo={deliveryAdditionalInfo}
              accessibilitiesId={accessibilitiesId}
            />
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <RelatedProductsSection
          businessId={businessId._id}
          currentProductId={productDetails._id}
        />
      </div>
    </div>
  );
};

export default page;
