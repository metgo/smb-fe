import Image from "next/image";

type IconImageProps = {
  icon: string;
  width?: number;
  height?: number;
  hasExtension?: boolean;
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
};

const IconImage = ({
  icon,
  onClick,
  width = 24,
  height = 24,
  hasExtension = false,
}: IconImageProps) => {
  const iconSrc = hasExtension
    ? `/images/icons/${icon}`
    : `/images/icons/${icon}.svg`;
  return (
    <Image
      alt={icon}
      width={width}
      height={height}
      onClick={onClick}
      src={iconSrc}
      className={`${onClick && "cursor-pointer hover:opacity-80"}  transition-opacity duration-200`}
    />
  );
};

export default IconImage;
