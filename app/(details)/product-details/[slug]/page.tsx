import { getProductDetailsBySlug, getProducts } from "@/actions/productActions";
import { NoDetailsFound, ProductDetailsFilterTab } from "../../_components";
import {
  ProductGallery,
  ProductInfoCards,
  ProductQtyBtns,
  RelatedProductsSection,
} from "../_components";

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (!slug || slug === "undefined") return <NoDetailsFound />;

  const productDetails: ProductDetailsProps =
    await getProductDetailsBySlug(slug);

  if (!productDetails) return <NoDetailsFound />;

  const relatedProducts: Product[] = await getProducts(
    productDetails.businessId._id,
  );

  const filteredRelatedProducts = relatedProducts?.filter?.(
    (item) => item._id !== productDetails._id,
  );

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
  } = productDetails;

  const firstDeliveryPrice = deliveryArea?.[0]?.price;
  const isFreeDelivery = firstDeliveryPrice === "0";

  return (
    <div
      className="min-h-screen transition-colors duration-300 bg-gray-50"
      dir="rtl"
    >
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-40 md:pt-20">
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
                  dangerouslySetInnerHTML={{ __html: description }}
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

        {/* INFO CARDS + DESCRIPTION/DELIVERY TABS */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Info Cards — 1/4 */}
          <div className="lg:w-1/4">
            <ProductInfoCards
              deliveryArea={deliveryArea}
              quantity={quantity}
              openingHrs={openingHrs}
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
            />
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <RelatedProductsSection products={filteredRelatedProducts} />
      </div>
    </div>
  );
};

export default page;
