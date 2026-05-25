import clsx from "clsx";
import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { type LucideIcon } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ITabs {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TabsSectionProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  tabs: ITabs[];
}

const TabsSection = ({ tabs, activeTab, setActiveTab }: TabsSectionProps) => {
  const { t } = useTranslation("common");
  const { isDark } = useThemeClasses();
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to center the active tab
  useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current) {
      const container = tabsContainerRef.current;
      const activeButton = activeTabRef.current;

      const containerWidth = container.offsetWidth;
      const buttonLeft = activeButton.offsetLeft;
      const buttonWidth = activeButton.offsetWidth;

      // Calculate the scroll position to center the button
      const scrollPosition = buttonLeft - containerWidth / 2 + buttonWidth / 2;

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [activeTab]);

  return (
    <div
      ref={tabsContainerRef}
      className={clsx("flex gap-1 overflow-x-auto scrollbar-hide")}
      style={{
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE and Edge
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            ref={isActive ? activeTabRef : null}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2 py-1.5 sm:px-4 sm:py-2 cursor-pointer rounded-t-lg flex items-center gap-1.5 whitespace-nowrap transition-colors text-xs sm:text-sm ${
              isActive
                ? isDark
                  ? "bg-gray-800 text-teal-400 border-b-2 border-teal-500"
                  : "bg-gray-100 text-teal-700 border-b-2 border-teal-600"
                : isDark
                  ? "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
                  : "text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            {t(tab.label)}
          </button>
        );
      })}
    </div>
  );
};

export default TabsSection;
