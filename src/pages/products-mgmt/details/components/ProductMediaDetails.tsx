import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ImageIcon } from "lucide-react";

interface ProductMediaDetailsProps {
  product: Product;
  t: (key: string) => string;
}

const ProductMediaDetails: React.FC<ProductMediaDetailsProps> = ({
  t,
  product,
}) => {
  const { isDark } = useThemeClasses();

  return (
    <div className="space-y-6">
      <div>
        <h3
          className={`text-sm mb-3 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {t("product_images") || "Product Images"}
        </h3>

        {product?.images ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <img
                src={product?.images?.[0]?.image}
                alt={product?.name || "Product image"}
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
        ) : (
          <div
            className={`p-8 rounded-lg border-2 border-dashed text-center ${
              isDark
                ? "border-gray-700 bg-gray-800/50"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <ImageIcon
              className={`w-12 h-12 mx-auto mb-3 ${
                isDark ? "text-gray-600" : "text-gray-400"
              }`}
            />
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              {t("no_images_up_loaded") || "No images uploaded"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductMediaDetails;
