import clsx from "clsx";
import { Building2 } from "lucide-react";

interface AuthorityTabsProps {
  dmos: IDmoRes[];
  activeTab: string | null;
  onTabChange: (id: string) => void;
  isDark: boolean;
}

const AuthorityTabs: React.FC<AuthorityTabsProps> = ({
  dmos,
  activeTab,
  onTabChange,
  isDark,
}) => {
  const tabs = [
    ...dmos.map((dmo) => ({
      id: dmo._id,
      label: dmo.name,
      count: dmo.authorityCount ?? 0,
      icon: dmo.logoPath ? (
        <img
          src={dmo.logoPath}
          alt={dmo.name}
          className="w-6 h-6 object-contain rounded-sm"
        />
      ) : (
        <Building2 className="w-4 h-4" />
      ),
    })),
  ];

  return (
    <div
      className={clsx(
        "flex gap-1 border-b overflow-x-auto",
        isDark ? "border-gray-700" : "border-gray-200",
      )}
      style={
        {
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        } as React.CSSProperties
      }
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors border-b-2 -mb-px",
              isActive
                ? isDark
                  ? "border-violet-500 text-violet-400"
                  : "border-violet-600 text-violet-700"
                : isDark
                  ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span
              className={clsx(
                "ml-0.5 px-1.5 py-0.5 text-xs rounded-full font-semibold",
                isActive
                  ? isDark
                    ? "bg-violet-500/20 text-violet-300"
                    : "bg-violet-100 text-violet-700"
                  : isDark
                    ? "bg-gray-700 text-gray-400"
                    : "bg-gray-100 text-gray-500",
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default AuthorityTabs;
