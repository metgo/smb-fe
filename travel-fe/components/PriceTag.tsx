const PriceTag = ({
  price,
  noStyle,
  className = "text-xl font-bold py-1 ",
}: {
  noStyle?: boolean;
  price: string | number | undefined;
  className?: string;
}) => {
  return <span className={noStyle ? "" : className}>₪{price}</span>;
};

export default PriceTag;
