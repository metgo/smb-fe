import { ProductCard } from "@/components/cards";
import { products } from "@/constant/placeholderData";

const ProductsTabContent = () => {
  return (
    <div>
      <div className="grid grid-cols-5 gap-5">
        {products?.map((product) => (
          <ProductCard key={product._id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default ProductsTabContent;
