import IconImage from "./IconImage";

type ImageCarouselControlsProps = {
  totalImages: number;
  activeIndex: number;
  setActiveImageIndex: React.Dispatch<React.SetStateAction<number>>;
};

const ImageCarouselControls: React.FC<ImageCarouselControlsProps> = ({
  totalImages,
  activeIndex,
  setActiveImageIndex,
}) => {
  if (totalImages < 2) return null;

  return (
    <div className="flex items-center justify-between mt-2">
      {/* Prev Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (activeIndex > 0) setActiveImageIndex((prev) => prev - 1);
        }}
        className="custom-cursor"
        disabled={activeIndex === 0}
      >
        <IconImage icon="next" width={30} height={30} />
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
        className="custom-cursor"
        disabled={activeIndex === totalImages - 1}
      >
        <IconImage icon="prev" width={30} height={30} />
      </button>
    </div>
  );
};

export default ImageCarouselControls;
