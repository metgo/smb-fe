import { ReturnToPrevPageBtn } from "@/app/(details)/_components";
import { CartProductsSection } from "../_components";

const page = () => {
  return (
    <>
      <ReturnToPrevPageBtn />
      <div className="mx-20 py-12">
        <CartProductsSection />
      </div>
    </>
  );
};

export default page;
