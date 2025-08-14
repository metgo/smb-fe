import { cartLabels } from "@/constant/hebrew";
import { ReturnToPrevPageBtn } from "@/app/(details)/_components";
import { RecommendedProducts, YourCartProducts } from "../_components";

const page = async () => {
  return (
    <>
      <ReturnToPrevPageBtn />
      <div className="mx-20 py-12">
        <YourCartProducts />

        <section>
          <h1 className="text-2xl font-bold text-center mt-20 mb-4">
            {cartLabels.youMayAlsoLike}
          </h1>
          <RecommendedProducts />
        </section>
      </div>
    </>
  );
};

export default page;
