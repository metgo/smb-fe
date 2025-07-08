const AttributePills = ({ items }: { items: Attributes[] }) => {
  if (items?.length === 0) return;

  return (
    <div className="flex flex-wrap items-center gap-2.5 mt-4.5">
      {items?.map((item) => (
        <div
          key={item._id}
          className="ps-4 pe-5 border border-theme rounded-4xl h-10.5 flex items-center justify-center"
        >
          <span className="font-bold text-sm text-theme">
            {item.hebrewName}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AttributePills;
