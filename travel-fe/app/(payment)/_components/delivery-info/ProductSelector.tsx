import Image from "next/image";
import { FaCircleCheck } from "react-icons/fa6";

interface ProductSelectorProps {
  products: DeliveryProductInfo[];
  clickedProductId: string | undefined;
  onProductClick: (productId: string) => void;
}

export const ProductSelector = ({
  products,
  clickedProductId,
  onProductClick,
}: ProductSelectorProps) => (
  <div className="flex gap-2 flex-wrap">
    {products.map((product) => (
      <button
        key={product._id}
        onClick={() => onProductClick(product._id)}
        className={`relative flex items-center gap-2 w-48 rounded-md custom-cursor bg-primary ${
          clickedProductId === product._id
            ? "border border-black/40 shadow-md"
            : ""
        }`}
      >
        <Image
          alt={product.alt}
          src={product.imageSrc}
          width={40}
          height={20}
          className="h-12 w-20 object-cover rounded-r-md"
        />
        <span className="line-clamp-2 font-bold  text-sm">{product.name}</span>
        {product.isSelected && (
          <FaCircleCheck
            size={20}
            className="text-green-500 bg-white absolute -top-1 -right-1 rounded-full"
          />
        )}
      </button>
    ))}
  </div>
);
