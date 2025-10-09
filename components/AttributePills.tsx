const AttributePills = ({ items }: { items: Attributes[] }) => {
  if (items?.length === 0) return;

  return (
    <div className="flex flex-wrap items-center gap-2.5 mt-4.5">
      {items?.map((item) => (
        <div
          key={item._id}
          className="px-4 border border-theme rounded-4xl max-sm:h-8 md:h-10.5 flex items-center justify-center"
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
