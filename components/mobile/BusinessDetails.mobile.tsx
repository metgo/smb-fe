import AttributePills from "../AttributePills";
import { ProductCard } from "../cards";

const MobileBusinessDetails = ({
  businessDetails,
  products,
}: {
  businessDetails: BusinessDetailsProps;
  products: Product[];
}) => {
  return (
    <div className="px-10 py-8">
      <section>
        <h1 className="text-6xl font-black">{businessDetails.name}</h1>
        <div
          className="font-bold text-2xl"
          dangerouslySetInnerHTML={{ __html: businessDetails?.description }}
        />
      </section>
      <section>
        <AttributePills
          items={[
            ...businessDetails?.accessibilitiesId,
            ...businessDetails?.groupTypesId,
          ]}
        />
      </section>
      <section className="flex gap-4 overflow-x-auto max-sm:px-4 max-sm:scroll-smooth max-sm:snap-x max-sm:snap-mandatory scrollbar-hide">
        {products?.map((product) => (
          <div
            key={product._id}
            className="flex-shrink-0 snap-start max-sm:w-[80%] sm:w-auto"
          >
            <ProductCard
              product={product}
              primaryCategoryId={businessDetails?.primaryCategoryId}
            />
          </div>
        ))}
      </section>

      <section></section>
      <section></section>
    </div>
  );
};

export default MobileBusinessDetails;
