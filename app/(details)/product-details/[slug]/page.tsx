import { misc } from "@/constant/hebrew";
import PriceTag from "@/components/PriceTag";
import { ProductCard } from "@/components/cards";
import { getProductDetailsBySlug, getProducts } from "@/actions/productActions";
import ProductDetailsFilterTab from "../../_components/ProductDetailsFilterTab";
import {
  AddToCartBuyNowBtns,
  MainProductImage,
  NoDetailsFound,
} from "../../_components";
import { categoryIds } from "@/lib/utils";
import MobileProductDetails from "@/components/mobile/ProductDetails.mobile";
import { Calendar, CheckIcon, TruckIcon, Users } from "lucide-react";

const page = async ({ params }: PageProps) => {
  const { slug } = await params;
  const features = ["מאפיין ראשון", "מאפיין שני", "מאפיין שלישי"];

  if (!slug || slug === "undefined") return <NoDetailsFound />;

  const productDetails: ProductDetailsProps =
    await getProductDetailsBySlug(slug);
  const relatedProducts: Product[] = await getProducts(
    productDetails.businessId._id,
  );

  const filteredRelatedProducts = relatedProducts?.filter?.(
    (item) => item._id !== productDetails?._id,
  );
  console.log("🚀 ~ page ~ productDetails:", productDetails);

  return (
    <div
      className="min-h-screen transition-colors duration-300 bg-gray-50"
      dir="rtl"
    >
      {/* ── DESKTOP ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 max-sm:hidden md:block">
        {/* HERO CARD */}
        <section className="rounded-3xl shadow-lg overflow-hidden bg-white mb-8">
          <div className="grid grid-cols-2 gap-0">
            {/* Right col – details */}
            <div className="p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <h1 className="font-bold text-[36px] leading-tight text-gray-900 mb-3">
                  {productDetails?.name}
                </h1>

                <div
                  className="text-gray-600 text-base leading-relaxed mb-6"
                  dangerouslySetInnerHTML={{
                    __html: productDetails?.description || "",
                  }}
                />
              </div>

              <div>
                {/* Price */}
                <div className="mb-6">
                  <PriceTag
                    price={productDetails?.price?.sellingPrice}
                    className="text-4xl font-bold text-teal-600"
                  />
                </div>
                {/* Left col – image */}
                <div className="relative min-h-[480px] bg-gray-100">
                  <MainProductImage
                    imageItem={productDetails?.images?.[0]}
                    primaryCategoryId={categoryIds.culture}
                    // pass className if MainProductImage supports it, otherwise wrap:
                    className="w-full h-full object-cover absolute inset-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* CTA buttons */}

        <section className="rounded-3xl shadow-lg overflow-hidden bg-white mb-8 py-6 px-6">
          <div className="text-3xl font-bold">בחר כמות</div>
          <AddToCartBuyNowBtns product={productDetails} />
        </section>

        {/* FILTER / TABS SECTION */}
        <div className="rounded-3xl shadow-lg bg-white mb-8 p-6 lg:p-8">
          <ProductDetailsFilterTab {...productDetails} />
        </div>

        <section>
          <div>
            <div className="flex items-start gap-8">
              <div className="flex flex-col gap-2 pt-1 mb-2">
                <div className="flex items-center gap-4 p-4  border border-gray-200 rounded-xl max-w-xs">
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg shrink-0">
                    <TruckIcon className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">משלוחים</p>
                    <p className="text-2xl font-medium text-gray-900">
                      delivery
                    </p>
                  </div>
                </div>{" "}
                <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl max-w-xs">
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg shrink-0">
                    <Users className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">עד היום נרכשו</p>
                    <p className="text-2xl font-medium text-gray-900">
                      delivery
                    </p>
                  </div>
                </div>{" "}
                <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl max-w-xs">
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg shrink-0">
                    <Calendar className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">שם העסק</p>
                    <p className="text-2xl font-medium text-gray-900">
                      delivery
                    </p>
                  </div>
                </div>{" "}
              </div>
              <div className="bg-white max-w-xl">
                <div className="text-5xl font-bold flex-shrink-0">מאפיינים</div>
                <ul className="mt-4 space-y-2 grid grid-cols-3 gap-6">
                  {features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <CheckIcon className="w-4 h-4 text-green-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>{" "}
            </div>
          </div>
        </section>

        {/* RELATED PRODUCTS */}
        {filteredRelatedProducts?.length > 0 && (
          <div className="rounded-3xl shadow-lg bg-white p-6 lg:p-8">
            <h2 className="font-bold text-2xl text-gray-900 mb-6 text-center">
              {misc.mayInterestYou}
            </h2>

            <div className="grid grid-cols-5 gap-5 w-full overflow-x-auto">
              {filteredRelatedProducts?.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  primaryCategoryId={""}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE ── */}
      <MobileProductDetails
        productDetails={productDetails}
        relatedProducts={filteredRelatedProducts}
      />
    </div>
  );
};

export default page;
