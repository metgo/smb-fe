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

  const maxVisible = 5;
  const centerPosition = Math.floor(maxVisible / 2);

  // Calculate starting index so active dot is visually centered
  let start = activeIndex - centerPosition;
  let end = activeIndex + centerPosition;

  // Clamp range to valid boundaries
  if (start < 0) {
    end += Math.abs(start);
    start = 0;
  }
  if (end > totalImages - 1) {
    start -= end - (totalImages - 1);
    end = totalImages - 1;
  }
  start = Math.max(start, 0);

  const visibleIndexes = Array.from(
    { length: Math.min(maxVisible, totalImages) },
    (_, i) => start + i,
  );

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
        className="custom-cursor border border-transparent hover:border-white rounded-full flex-shrink-0"
        disabled={activeIndex === 0}
      >
        <IconImage icon="next" width={iconSize} height={iconSize} />
      </button>

      {/* Dots Indicator */}
      <div className="flex items-center gap-2">
        {visibleIndexes.map((index) => {
          const distance = Math.abs(index - activeIndex);

          // scale + opacity decrease gradually away from center
          const scale = Math.max(1 - distance * 0.06, 0.6);
          const opacity = Math.max(1 - distance * 0.25, 0.4);
          const isActive = index === activeIndex;

          return (
            <span
              key={index}
              className="rounded-full transition-all duration-300 ease-in-out"
              style={{
                width: isActive ? 12 : 10 * scale,
                height: isActive ? 12 : 10 * scale,
                backgroundColor: isActive ? "white" : "rgba(255,255,255,0.6)",
                opacity,
                transform: `scale(${scale})`,
              }}
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
        className="custom-cursor border border-transparent hover:border-white rounded-full flex-shrink-0"
        disabled={activeIndex === totalImages - 1}
      >
        <IconImage icon="prev" width={iconSize} height={iconSize} />
      </button>
    </div>
  );
};

export default ImageCarouselControls;
