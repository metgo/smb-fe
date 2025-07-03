import { eventFeatures } from "@/lib/utils";

const AttributePills = () => {
  return (
    <div className="flex flex-wrap items-center gap-2.5 mt-4.5">
      {eventFeatures.map((item) => (
        <div
          key={item.id}
          className="ps-4 pe-5 border border-theme rounded-4xl h-10.5 flex items-center justify-center"
        >
          <span className="font-bold text-sm text-theme">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default AttributePills;
