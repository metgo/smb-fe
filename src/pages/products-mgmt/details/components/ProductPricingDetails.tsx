import React from 'react'

interface ProductPricingDetailsProps {
  product: Product;
  theme: Theme;
  t: (key: string)=>string;
}

const ProductPricingDetails: React.FC<ProductPricingDetailsProps> = ({
  product,
  theme,
  t,
}) => {
  const discountAmount = product.markedPrice - product.sellingPrice
  const discountPercent =
    product.markedPrice > 0
      ? Math.round((discountAmount / product.markedPrice) * 100)
      : 0

  return (
    <div className="space-y-6">
      {/* Prices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Marked Price */}
        <div
          className={`p-4 rounded-lg border ${theme === 'dark'
              ? 'border-gray-700 bg-gray-800/50'
              : 'border-gray-200 bg-gray-50'
            }`}
        >
          <h3
            className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
          >
            {t('marked_price') || 'Marked Price'}
          </h3>
          <p
            className={`text-3xl font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}
          >
            ₪{product.markedPrice.toLocaleString()}
          </p>
        </div>

        {/* Selling Price */}
        <div
          className={`p-4 rounded-lg border ${theme === 'dark'
              ? 'border-teal-700 bg-teal-950/30'
              : 'border-teal-200 bg-teal-50'
            }`}
        >
          <h3
            className={`text-sm mb-2 ${theme === 'dark' ? 'text-teal-400' : 'text-teal-700'
              }`}
          >
            {t('selling_price') || 'Selling Price'}
          </h3>
          <p
            className={`text-3xl font-bold ${theme === 'dark' ? 'text-teal-300' : 'text-teal-800'
              }`}
          >
            ₪{product.sellingPrice.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Discount */}
      {discountAmount > 0 && (
        <div
          className={`p-4 rounded-lg border ${theme === 'dark'
              ? 'border-orange-700 bg-orange-950/30'
              : 'border-orange-200 bg-orange-50'
            }`}
        >
          <h3
            className={`text-sm mb-2 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-700'
              }`}
          >
            {t('discount') || 'Discount'}
          </h3>
          <div className="flex items-baseline gap-3">
            <p
              className={`text-2xl font-bold ${theme === 'dark' ? 'text-orange-300' : 'text-orange-800'
                }`}
            >
              ₪{discountAmount.toLocaleString()}
            </p>
            <p
              className={`text-lg ${theme === 'dark' ? 'text-orange-400' : 'text-orange-700'
                }`}
            >
              ({discountPercent}% off)
            </p>
          </div>
        </div>
      )}

      {/* Sales Statistics */}
      <div
        className={`p-4 rounded-lg border ${theme === 'dark'
            ? 'border-gray-700 bg-gray-800/50'
            : 'border-gray-200 bg-gray-50'
          }`}
      >
        <h3
          className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
        >
          {t('sales_statistics') || 'Sales Statistics'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs mb-1 text-gray-500">
              {t('units_sold') || 'Units Sold'}
            </p>
            <p
              className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}
            >
              {product.soldCount.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs mb-1 text-gray-500">
              {t('total_revenue') || 'Total Revenue'}
            </p>
            <p
              className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}
            >
              ₪{(product.soldCount * product.sellingPrice).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs mb-1 text-gray-500">
              {t('avg_order_value') || 'Avg Order Value'}
            </p>
            <p
              className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}
            >
              ₪{product.sellingPrice.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPricingDetails
