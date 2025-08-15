import { CartProducts } from "../_components";
import { ReturnToPrevPageBtn } from "@/app/(details)/_components";

const page = async () => {
  return (
    <>
      <ReturnToPrevPageBtn />
      <CartProducts />
    </>
  );
};

export default page;
