import { Check, Star } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ImageWithFallback } from "@/components/shared";

interface TripImageSelectionProps {
  t: (key: string) => string;
  selectedImages: SelectedImage[];
  setSelectedImages: (images: SelectedImage[]) => void;
  selectedStationDetails: IStationDetailsProps[];
}

const TripImageSelection = ({
  t,
  selectedImages,
  setSelectedImages,
  selectedStationDetails,
}: TripImageSelectionProps) => {
  const { isDark, borderColor } = useThemeClasses();

  const isImageSelected = (stationId: string, image: string) =>
    selectedImages.some(
      (img) => img.stationId === stationId && img.image === image,
    );

  const toggleImage = (stationId: string, image: ITripImage) => {
    const alreadySelected = isImageSelected(stationId, image.image);

    if (alreadySelected) {
      const removingPrimary = selectedImages.some(
        (img) =>
          img.stationId === stationId &&
          img.image === image.image &&
          img.isPrimary,
      );
      const remaining = selectedImages.filter(
        (img) => !(img.stationId === stationId && img.image === image.image),
      );
      if (removingPrimary && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isPrimary: true };
      }
      setSelectedImages(remaining);
    } else {
      const newImage: SelectedImage = {
        image: image.image,
        caption: image.caption ?? "",
        alt: image.alt ?? "",
        isPrimary: selectedImages.length === 0,
        stationId,
      };
      setSelectedImages([...selectedImages, newImage]);
    }
  };

  const setPrimaryImage = (stationId: string, image: string) => {
    setSelectedImages(
      selectedImages.map((img) => ({
        ...img,
        isPrimary: img.stationId === stationId && img.image === image,
      })),
    );
  };

  return (
    <div className="space-y-6">
      <h3 className={`text-lg ${isDark ? "text-gray-200" : "text-gray-800"}`}>
        {t("media")}
      </h3>

      {selectedStationDetails.length === 0 && (
        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {t("station_not_selected_yet")}
        </p>
      )}

      {selectedStationDetails.map((station) => (
        <div key={station._id}>
          <label
            className={`block text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {station.name}
          </label>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(station.images ?? []).map((image, idx) => {
              const selected = isImageSelected(station._id, image.image);
              const primary = selectedImages.some(
                (img) =>
                  img.stationId === station._id &&
                  img.image === image.image &&
                  img.isPrimary,
              );

              return (
                <div
                  key={idx}
                  className={`relative aspect-square rounded-lg overflow-hidden border group cursor-pointer ${
                    selected
                      ? "border-teal-500 ring-2 ring-teal-500"
                      : borderColor
                  }`}
                  onClick={() => toggleImage(station._id, image)}
                >
                  <ImageWithFallback
                    src={image.image}
                    alt={image.alt || station.name}
                    className="w-full h-full object-cover"
                  />

                  {selected && (
                    <div className="absolute top-2 right-2 p-1 bg-teal-600 text-white rounded-full z-10">
                      <Check className="w-4 h-4" />
                    </div>
                  )}

                  {primary && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded z-10">
                      {t("primary_image")}
                    </div>
                  )}

                  {selected && !primary && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrimaryImage(station._id, image.image);
                      }}
                      className="absolute bottom-2 left-2 right-2 cursor-pointer px-3 py-1.5 bg-teal-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-teal-700 flex items-center justify-center gap-1"
                    >
                      <Star className="w-3 h-3" />
                      {t("set_as_primary")}
                    </button>
                  )}
                </div>
              );
            })}

            {(station.images ?? []).length === 0 && (
              <p
                className={`text-xs col-span-full ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {t("no_station_images_found")}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TripImageSelection;
