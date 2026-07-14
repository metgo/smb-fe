import { useThemeClasses } from "@/hooks/useThemeClasses";
import { StatusPill } from "@/components/pills";

interface TripPreviewProps {
  t: (key: string) => string;
  formData: {
    name: string | null;
    estimatedDuration: number | null;
    status: string;
  };
  description: string;
  shortDescription: string;
  selectedImages: SelectedImage[];
  selectedStationDetails: IStationDetailsProps[];
}

const TripPreview = ({
  t,
  formData,
  description,
  shortDescription,
  selectedImages,
  selectedStationDetails,
}: TripPreviewProps) => {
  const { isDark, borderColor, textPrimary } = useThemeClasses();

  const row = (label: string, value: React.ReactNode) => (
    <div className={`flex items-start justify-between gap-4 py-3 border-b ${borderColor}`}>
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className={`text-sm text-right ${textPrimary}`}>{value || "-"}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className={`text-lg ${isDark ? "text-gray-200" : "text-gray-800"}`}>
        {t("review_submit")}
      </h3>

      <div>
        {row(t("trip_name"), formData.name)}
        {row(t("short_description"), shortDescription?.replace(/<[^>]*>/g, ""))}
        {row(t("description"), description?.replace(/<[^>]*>/g, ""))}
        {row(t("estimated_duration"), formData.estimatedDuration)
        }
        {row(t("status"), <StatusPill status={formData.status} />)}
        {row(t("stations"), selectedStationDetails.length)}
        {row(t("images"), selectedImages.length)}
      </div>

      {selectedImages.length > 0 && (
        <div>
          <label className="block text-sm mb-2 text-gray-500">
            {t("media")}
          </label>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {selectedImages.map((img, idx) => (
              <img
                key={idx}
                src={img.image}
                alt={img.alt || `Image ${idx + 1}`}
                className="w-full aspect-square object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {selectedStationDetails.length > 0 && (
        <div>
          <label className="block text-sm mb-2 text-gray-500">
            {t("stations")}
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedStationDetails.map((station) => (
              <span
                key={station._id}
                className="px-3 py-1.5 rounded-full text-sm bg-teal-500/20 text-teal-600"
              >
                {station.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPreview;
