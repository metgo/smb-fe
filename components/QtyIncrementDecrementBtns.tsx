import clsx from "clsx";
import { FaMinus, FaPlus } from "react-icons/fa6";

import useCartStore from "@/stores/cartStore";

interface Props {
  _id: string;
  quantity: number;
  isThresholdQty: boolean;
}
const QtyIncrementDecrementBtns = ({
  _id,
  quantity,
  isThresholdQty,
}: Props) => {
  const { cartProducts, updateQuantity } = useCartStore();

  function handleChangeQuantity(productId: string, delta: number) {
    const product = cartProducts.find((p) => p._id === productId);
    if (!product) return;

    const newQty = quantity + delta;

    // Prevent quantity going below 1
    if (newQty < 1) return;

    updateQuantity(productId, newQty);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="qtyBtn cursor-pointer"
        onClick={() => handleChangeQuantity(_id, +1)}
      >
        <FaPlus />
      </button>

      <span>{quantity}</span>

      <button
        type="button"
        disabled={isThresholdQty}
        className={clsx(
          isThresholdQty ? "cursor-not-allowed" : "cursor-pointer",
          "qtyBtn",
        )}
        onClick={() => handleChangeQuantity(_id, -1)}
      >
        <FaMinus />
      </button>
    </div>
  );
};

export default QtyIncrementDecrementBtns;
