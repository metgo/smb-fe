"use client";

import { useItemBuyCart } from "@/hooks";
import { itemTypeEnum } from "@/lib/utils";
import { Minus, Plus, ShoppingCart, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const ProductQtyBtns = ({ product }: { product: ProductDetailsProps }) => {
  const [qty, setQty] = useState(1);

  const { addToCart, quickPurchase } = useItemBuyCart();

  function handleQtyChange(operator: string) {
    if (operator === "increment") setQty((prev) => prev + 1);
    else setQty((prev) => Math.max(1, prev - 1));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-3xl shadow-lg p-6 sm:p-8 mb-8 bg-white"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-900">בחר כמות</h2>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Quantity Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleQtyChange("decrement")}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-gray-100 text-gray-900 hover:bg-gray-200"
            >
              <Minus className="w-5 h-5" />
            </motion.button>

            <span className="text-2xl font-bold min-w-[40px] text-center text-gray-900">
              {qty}
            </span>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleQtyChange("increment")}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-gray-100 text-gray-900 hover:bg-gray-200"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Total Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-gray-600">סה"כ:</span>
          <span className="text-3xl font-bold text-teal-600">
            ₪{product.price.sellingPrice * qty}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mr-auto">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={(e) => addToCart(e, product, qty, itemTypeEnum.product)}
            className="px-6 py-3 rounded-xl transition-all flex items-center gap-2 text-base font-bold min-h-[44px] bg-gray-100 text-gray-900 hover:bg-gray-200"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>הוסף לעגלה</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={(e) => quickPurchase(e, product, itemTypeEnum.product)}
            className="px-8 py-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all flex items-center gap-2 text-base font-bold min-h-[44px]"
          >
            <Sparkles className="w-5 h-5" />
            <span>רכישה מהירה</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductQtyBtns;
