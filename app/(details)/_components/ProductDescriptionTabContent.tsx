import { CheckCircle } from "lucide-react";

const ProductDescriptionTabContent = ({
  accessibilitiesId,
}: {
  accessibilitiesId: {
    hebrewName: string;
    name: string;
    _id: string;
  }[];
}) => {
  return (
    <div>
      {/* <div
        className="font-normal"
        dangerouslySetInnerHTML={{ __html: description || "" }}
      /> */}
      {!accessibilitiesId?.length ? (
        <p className="text-gray-500 text-sm">אין נגישות זמינה</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {accessibilitiesId.map((attr) => (
            <div
              key={attr._id}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap bg-gray-100 text-gray-700"
            >
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />{" "}
              <span className="text-sm font-medium">
                {attr.hebrewName || attr.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductDescriptionTabContent;
