import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  Accessibility,
  Clock,
  FileText,
  Globe,
  ImageIcon,
  MapPin,
  Truck,
  Users,
} from "lucide-react";

interface TabsSectionProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  t: (key: string) => string;
}

const TabsSection = ({ activeTab, setActiveTab, t }: TabsSectionProps) => {
  const { isDark } = useThemeClasses();

  const tabs = [
    { id: "overview", label: t("overview"), icon: FileText },
    { id: "contact", label: t("contact_ownership"), icon: Users },
    { id: "location", label: t("location_map"), icon: MapPin },
    { id: "media", label: t("images_branding"), icon: ImageIcon },
    { id: "social", label: t("social_networks"), icon: Globe },
    { id: "delivery", label: t("delivery_policy"), icon: Truck },
    {
      id: "accessibility",
      label: t("accessibility_group_types"),
      icon: Accessibility,
    },
    { id: "hours", label: t("operating_hours"), icon: Clock },
  ];

  return (
    <div className="flex gap-1 mt-6 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 cursor-pointer rounded-t-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? isDark
                  ? "bg-gray-800 text-teal-400 border-b-2 border-teal-500"
                  : "bg-gray-100 text-teal-700 border-b-2 border-teal-600"
                : isDark
                  ? "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
                  : "text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
export default TabsSection;
