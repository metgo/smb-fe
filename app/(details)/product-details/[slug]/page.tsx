import Link from "next/link";

import { ProductCard } from "@/components/cards";
import { IconImage, NextImage } from "@/components/ui";
import { misc, productDetailsText } from "@/constant/hebrew";

import { NoDetailsFound, ReturnToPrevPageBtn } from "../../_components";
import { getProductDetailsBySlug, getProducts } from "@/actions/productActions";
import ProductDetailsFilterTab from "../../_components/ProductDetailsFilterTab";

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (!slug || slug === "undefined") return <NoDetailsFound />;

  const productDetails: ProductDetailsProps =
    await getProductDetailsBySlug(slug);
  const relatedProducts: Product[] = await getProducts(
    productDetails.businessId._id,
  );

  return (
    <div>
      <ReturnToPrevPageBtn />

      <div className="mx-20 py-12">
        <section className="grid grid-cols-2 gap-10">
          <div className="col-span-1">
            <NextImage
              width={575}
              height={533}
              alt={productDetails.images[0].alt}
              imgSrc={productDetails.images[0].image}
              className="w-full rounded-2xl"
            />
          </div>
          <div className="col-span-1">
            <h1 className="font-bold text-[40px]">{productDetails.name}</h1>
            <div
              className="font-normal"
              dangerouslySetInnerHTML={{ __html: productDetails?.description }}
            />
            <div>{productDetails?.price?.markedPrice}</div>
            <div className=" flex items-center gap-2.5">
              <Link
                href={`/check-out?productId=${productDetails._id}`}
                className="bg-dark rounded-xl px-6 py-2.75 font-bold text-white"
              >
                {productDetailsText.continuePlaceOrder}
              </Link>
              <button
                type="button"
                className="border border-theme text-theme rounded-xl py-2 flex items-center gap-1"
              >
                <IconImage icon="circular-cart" />
                <span>{productDetailsText.addToCart}</span>
              </button>
            </div>
          </div>
        </section>

        <ProductDetailsFilterTab {...productDetails} />

        {/* Related Products */}
        <div>
          <h2 className="text-center font-bold text-2xl mb-4">
            {misc.mayInterestYou}
          </h2>

          <div className="flex flex-col items-center justify-center gap-4">
            <div className="grid grid-cols-5 gap-5 w-full">
              {relatedProducts?.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  primaryCategoryId={""}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
