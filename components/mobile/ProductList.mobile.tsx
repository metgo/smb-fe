import { ProductCard } from "../cards";

interface MobileProductListProps {
  products: Product[];
  primaryCategoryId: string;
}

const MobileProductList = ({
  products,
  primaryCategoryId,
}: MobileProductListProps) => {
  const isSingleItem = products?.length === 1;

  return (
    <section
      className={`flex gap-4 mt-4 mx-4 overflow-x-auto max-sm:scroll-smooth max-sm:snap-x max-sm:snap-mandatory scrollbar-hide ${
        isSingleItem ? "justify-center" : ""
      }`}
    >
      {products?.map((product) => (
        <div
          key={product._id}
          className="flex-shrink-0 snap-start max-sm:w-[240px] sm:w-auto relative"
        >
          <ProductCard
            product={product}
            primaryCategoryId={primaryCategoryId}
          />
        </div>
      ))}
    </section>
  );
};

export default MobileProductList;
