import IconImage from "./IconImage";

type ImageCarouselControlsProps = {
  totalImages: number;
  activeIndex: number;
  iconSize?: number;
  setActiveImageIndex: React.Dispatch<React.SetStateAction<number>>;
};

const ImageCarouselControls: React.FC<ImageCarouselControlsProps> = ({
  totalImages,
  activeIndex,
  iconSize = 36,
  setActiveImageIndex,
}) => {
  if (totalImages < 2) return null;

  return (
    <div
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      className="flex items-center justify-between mt-2"
    >
      {/* Prev Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (activeIndex > 0) setActiveImageIndex((prev) => prev - 1);
        }}
        className="custom-cursor border border-transparent hover:border-white rounded-full flex-shirnk-0"
        disabled={activeIndex === 0}
      >
        <IconImage icon="next" width={iconSize} height={iconSize} />
      </button>

      {/* Dots Indicator */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalImages }).map((_, index) => {
          const isActive = index === activeIndex;
          return (
            <span
              key={index}
              className={`${
                isActive ? "w-2.5 h-2.5 bg-white" : "w-2 h-2 bg-gray-400"
              } rounded-full transition-all duration-300`}
            />
          );
        })}
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (activeIndex < totalImages - 1)
            setActiveImageIndex((prev) => prev + 1);
        }}
        className="custom-cursor border border-transparent hover:border-white rounded-full flex-shirnk-0"
        disabled={activeIndex === totalImages - 1}
      >
        <IconImage icon="prev" width={iconSize} height={iconSize} />
      </button>
    </div>
  );
};

export default ImageCarouselControls;
