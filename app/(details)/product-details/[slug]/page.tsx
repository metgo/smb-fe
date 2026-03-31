import { getProductDetailsBySlug } from "@/actions/productActions";
import { NoDetailsFound } from "../../_components";
import { ProductDetailsContent } from "../_components";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (!slug || slug === "undefined") return <NoDetailsFound />;

  const productDetails: ProductDetailsProps =
    await getProductDetailsBySlug(slug);

  if (!productDetails) return <NoDetailsFound />;

  return <ProductDetailsContent productDetails={productDetails} />;
};

export default page;
