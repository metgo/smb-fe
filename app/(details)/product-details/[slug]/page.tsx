import Link from "next/link";

import { NoDetailsFound, ReturnToPrevPageBtn } from "../../_components";
import { IconImage, NextImage } from "@/components/ui";
import { productDetailsText } from "@/constant/hebrew";
import { getProductDetailsBySlug } from "@/actions/productActions";
import ProductDetailsFilterTab from "../../_components/ProductDetailsFilterTab";

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (!slug || slug === "undefined") return <NoDetailsFound />;

  const productDetails: ProductDetailsProps =
    await getProductDetailsBySlug(slug);

  // const relatedProducts = getAllProducts()
  return (
    <div>
      <ReturnToPrevPageBtn />

      <div className="mx-20 py-12">
        <section className="grid grid-cols-2 gap-10">
          <div className="col-span-1">
            {productDetails?.images?.map((item, index) => {
              return (
                <div key={index} className="">
                  <NextImage
                    width={575}
                    height={533}
                    alt={item.alt}
                    imgSrc={item.image}
                    className=""
                  />
                </div>
              );
            })}
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
                href={"#"}
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
      </div>

      {/* Related Products */}
      <div></div>
    </div>
  );
};

export default page;
