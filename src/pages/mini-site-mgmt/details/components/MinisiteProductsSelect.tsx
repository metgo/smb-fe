import { ImageWithFallback } from "@/components/shared";
import clsx from "clsx";

interface Product {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
}

interface SectionProps {
  miniSite: {
    productIds?: Product[];
  };
  t: any; // translation function
  isDark?: boolean;
  textPrimary?: string;
  textSecondary?: string;
  borderColor?: string;
}

const MinisiteProductsList = ({
  miniSite,
  t,
  isDark = false,
  textPrimary = "text-gray-900 dark:text-white",
  textSecondary = "text-gray-500 dark:text-gray-400",
  borderColor = "border-gray-200 dark:border-gray-700",
}: SectionProps) => {
  //main products
  const products = miniSite?.productIds ?? [];

  if (products?.length === 0) {
    return (
      <div className="w-full py-12 px-4 text-center">
        <p className={clsx(textSecondary, "text-lg")}>
          {t("noProductsAvailable") || "אין מוצרים זמינים כרגע"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {products.map((product) => {
        const primaryImage = product.image;

        return (
          <div
            key={product._id}
            className={clsx(
              "group flex flex-col border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300",
              borderColor,
              isDark ? "bg-gray-900/50" : "bg-white",
            )}
          >
            {/* Image */}
            <div
              className={clsx(
                "aspect-square relative overflow-hidden",
                isDark ? "bg-gray-800" : "bg-gray-50",
              )}
            >
              {primaryImage ? (
                <ImageWithFallback
                  src={primaryImage}
                  alt={product.name}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div
                  className={clsx(
                    "w-full h-full flex items-center justify-center text-xs",
                    textSecondary,
                  )}
                >
                  {t("no_image") || "—"}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-3.5 md:p-4">
              <h3
                className={clsx(
                  "text-sm md:text-base font-semibold mb-1 leading-tight line-clamp-2",
                  textPrimary,
                )}
                title={product.name}
              >
                {product.name}
              </h3>

              {/* Description – limited lines */}
              <div
                className={clsx(
                  "text-xs md:text-sm mb-3 line-clamp-2 prose prose-sm dark:prose-invert max-w-none",
                  textSecondary,
                )}
                dangerouslySetInnerHTML={{ __html: product.description }}
              />

              {/* Price – bottom aligned */}
              <div className="mt-auto pt-2">
                <span
                  className={clsx("text-lg md:text-xl font-bold", textPrimary)}
                >
                  ₪{product.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MinisiteProductsList;
