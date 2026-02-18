interface Product {
  _id: string;
  name: string;
  description: string;
  images: Array<{
    image: string;
    caption?: string;
    alt?: string;
    subCoordinates?: Record<string, number>;
  }>;
  price: {
    markedPrice: number;
    sellingPrice: number;
    discountAmount?: number;
    discountPercent?: number;
    _id: string;
  };
  quantity: {
    sold: number;
    isUnlimited: boolean;
    _id: string;
    remaining?: number | null;
  };
}

interface SectionProps {
  miniSite: {
    productIds?: Product[];
  };
  t: any; // translation function
  textPrimary?: string;
  textSecondary?: string;
  borderColor?: string;
}

const MinisiteProductsList = ({
  miniSite,
  t,
  textPrimary = "text-gray-800",
  textSecondary = "text-gray-500",
  borderColor = "border-gray-200",
}: SectionProps) => {
  //main products
  const products = miniSite?.productIds ?? [];

  if (products?.length === 0) {
    return (
      <div className="w-full py-12 px-4 text-center">
        <p className={`${textSecondary} text-lg`}>
          {t("noProductsAvailable") || "אין מוצרים זמינים כרגע"}
        </p>
      </div>
    );
  }

  return (
    <div dir="rtl" className=" mx-auto space-y-4 md:space-y-6">
      {products.map((product) => {
        const primaryImage = product.images?.[0]?.image;
        const hasDiscount =
          product.price.markedPrice > product.price.sellingPrice;

        return (
          <div
            key={product._id}
            className={`border ${borderColor} rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row`}
          >
            {/* Image – left side on larger screens */}
            {primaryImage && (
              <div className="sm:w-48 md:w-56 lg:w-64 shrink-0">
                <div className="aspect-4/3 sm:aspect-square relative overflow-hidden bg-gray-50">
                  <img
                    src={primaryImage}
                    alt={product.images[0].alt || product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 flex flex-col p-5 md:p-6">
              <div className="flex-1">
                <h3
                  className={`text-xl md:text-2xl font-semibold ${textPrimary} mb-2 leading-tight`}
                >
                  {product.name}
                </h3>

                {/* Description – limited lines */}
                <div
                  className={`text-sm md:text-base ${textSecondary} mb-4 line-clamp-3 md:line-clamp-4 prose prose-sm max-w-none`}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>

              {/* Price + Button – bottom aligned */}
              <div className="mt-4 md:mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <span
                    className={`text-2xl md:text-3xl font-bold ${textPrimary}`}
                  >
                    ₪{product.price.sellingPrice.toLocaleString()}
                  </span>

                  {hasDiscount && (
                    <>
                      <span
                        className={`text-lg ${textSecondary} line-through opacity-70`}
                      >
                        ₪{product.price.markedPrice.toLocaleString()}
                      </span>
                      {product.price.discountPercent && (
                        <span className="text-sm font-medium text-green-600 bg-green-100 px-2.5 py-1 rounded">
                          {product.price.discountPercent}% הנחה
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MinisiteProductsList;
