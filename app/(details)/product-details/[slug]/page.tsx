import { misc } from "@/constant/hebrew";
import PriceTag from "@/components/PriceTag";
import { ProductCard } from "@/components/cards";
import { getProductDetailsBySlug, getProducts } from "@/actions/productActions";
import ProductDetailsFilterTab from "../../_components/ProductDetailsFilterTab";
import {
  AddToCartBuyNowBtns,
  MainProductImage,
  NoDetailsFound,
  ReturnToPrevPageBtn,
} from "../../_components";
import { categoryIds } from "@/lib/utils";

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (!slug || slug === "undefined") return <NoDetailsFound />;

  const productDetails: ProductDetailsProps =
    await getProductDetailsBySlug(slug);
  const relatedProducts: Product[] = await getProducts(
    productDetails.businessId._id,
  );

  const filteredRelatedProducts = relatedProducts?.filter?.(
    (item) => item._id !== productDetails?._id,
  );
  return (
    <div>
      <ReturnToPrevPageBtn />

      <div className="mx-20 py-12">
        <section className="grid grid-cols-2 gap-10">
          <MainProductImage
            imageItem={productDetails?.images?.[0]}
            primaryCategoryId={categoryIds.culture}
          />
          <div className="col-span-1">
            <h1 className="font-bold text-[40px]">{productDetails?.name}</h1>
            <div
              className="font-normal"
              dangerouslySetInnerHTML={{ __html: productDetails?.description }}
            />

            <PriceTag
              price={productDetails?.price?.sellingPrice}
              className="text-[32px] text-dark font-normal my-2.5"
            />
            <AddToCartBuyNowBtns product={productDetails} />
          </div>
        </section>

        <ProductDetailsFilterTab {...productDetails} />

        {/* Related Products */}
        {filteredRelatedProducts?.length > 0 && (
          <div>
            <h2 className="text-center font-bold text-2xl mb-4">
              {misc.mayInterestYou}
            </h2>

            <div className="flex flex-col items-center justify-center gap-4">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
