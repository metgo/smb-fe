const ProductDescriptionTabContent = ({
  description,
}: {
  description: string;
}) => {
  return (
    <div
      className="font-normal"
      dangerouslySetInnerHTML={{ __html: description || "" }}
    />
  );
};

export default ProductDescriptionTabContent;
