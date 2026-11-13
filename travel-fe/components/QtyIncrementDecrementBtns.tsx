import clsx from "clsx";
import { FaMinus, FaPlus } from "react-icons/fa6";

import useCartStore from "@/stores/cartStore";

interface Props {
  item: any;
  quantity: number;
  isThresholdQty: boolean;
}
const QtyIncrementDecrementBtns = ({
  item,
  quantity,
  isThresholdQty,
}: Props) => {
  const { cartItems, updateQuantity } = useCartStore();

  function handleChangeQuantity(delta: number) {
    const product = cartItems.find((p) => p._id === item._id);
    if (!product) return;

    const newQty = quantity + delta;

    // Prevent quantity going below 1
    if (newQty < 1) return;

    updateQuantity(item, newQty);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="size-9 rounded-full border border-secondary flex items-center justify-center custom-cursor"
        onClick={() => handleChangeQuantity(+1)}
      >
        <FaPlus />
      </button>

      <span>{quantity}</span>

      <button
        type="button"
        disabled={isThresholdQty}
        className={clsx(
          isThresholdQty ? "cursor-not-allowed" : "custom-cursor",
          "size-9 rounded-full border border-secondary flex items-center justify-center",
        )}
        onClick={() => handleChangeQuantity(-1)}
      >
        <FaMinus />
      </button>
    </div>
  );
};

export default QtyIncrementDecrementBtns;
