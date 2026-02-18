import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  searchQuery?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery }) => {
  const { t } = useTranslation("common");
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <Search className="w-12 h-12 mb-4 text-gray-300" />
      <p className="text-lg font-medium mb-1">
        {searchQuery ? `"${searchQuery}" ${t("not_found")}` : t("no_data")}
      </p>
      {!searchQuery && (
        <p className="text-sm text-gray-400">
          Try adjusting your filters or check back later.
        </p>
      )}
    </div>
  );
};

export default EmptyState;
