import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  Accessibility,
  Bell,
  Calendar,
  FileText,
  ImageIcon,
  MapPin,
  Ticket,
  Users,
  // Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface TabsSectionProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

const TabsSection = ({ activeTab, setActiveTab }: TabsSectionProps) => {
  const { t } = useTranslation("common");
  const { isDark } = useThemeClasses();

  const tabs = [
    { id: "overview", label: t("overview"), icon: FileText },
    { id: "attributes", label: t("attributes"), icon: Accessibility },
    { id: "date_time", label: t("date_time"), icon: Calendar },
    { id: "location", label: t("location_map"), icon: MapPin },
    { id: "media", label: t("media"), icon: ImageIcon },
    { id: "tickets", label: t("tickets"), icon: Ticket },
    { id: "registration", label: t("registration"), icon: Users },
    {
      id: "schedual_notification",
      label: t("schedual_notification"),
      icon: Bell,
    },
  ];

  return (
    <div className="flex gap-1 mt-6 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
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
