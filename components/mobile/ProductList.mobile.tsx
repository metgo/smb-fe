import { ProductCard } from "../cards";

interface MobileProductListProps {
  products: Product[];
  primaryCategoryId: string;
}

const MobileProductList = ({
  products,
  primaryCategoryId,
}: MobileProductListProps) => {
  return (
    <section className="flex gap-4 mt-4 ms-4 overflow-x-auto max-sm:px-4 max-sm:scroll-smooth max-sm:snap-x max-sm:snap-mandatory scrollbar-hide">
      {products?.map((product) => (
        <div
          key={product._id}
          className="flex-shrink-0 snap-start max-sm:w-[80%] sm:w-auto relative"
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
