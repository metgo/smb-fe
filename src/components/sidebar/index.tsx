import { useRef, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Package,
  ShoppingCart,
  Calendar,
  MapPin,
  Map,
  Sparkles,
  Wallet,
  Globe,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Ticket,
  Receipt,
  Megaphone,
  FileText,
  Rss,
  SlidersHorizontal,
  Layout,
  Users,
  File,
  UserCircle,
  BellIcon,
  Layers2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { useTranslation } from "react-i18next";
import { toggleSidebar } from "@/features/uiSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { routes } from "@/lib/routes";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useUserRoles } from "@/hooks/useUserRoles";

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  isEnabled: boolean;
  subItems?: MenuItem[];
}

export default function Sidebar() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useAppDispatch();

  const { isDark, isRTL } = useThemeClasses();
  const { isTraveller } = useUserRoles();
  const { isSidebarCollapsed } = useAppSelector((state) => state.ui);

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const subItemsRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      path: routes.dashboard,
      label: t("dashboard") || "Dashboard",
      icon: LayoutDashboard,
      isEnabled: true,
    },
    {
      id: "businesses",
      path: routes.businessMgmt,
      label: t("businesses") || "Businesses",
      icon: Building2,
      isEnabled: true,
    },
    {
      id: "products",
      path: routes.productsMgmt,
      label: t("products") || "Products",
      icon: Package,
      isEnabled: true,
    },
    {
      id: "orders",
      path: routes.ordersMgmt,
      label: t("orders") || "Orders",
      icon: ShoppingCart,
      isEnabled: true,
    },
    {
      id: "events",
      path: routes.eventsMgmt,
      label: t("events") || "Events",
      icon: Calendar,
      isEnabled: true,
    },
    {
      id: "notifications",
      path: routes.notificationMgmt,
      label: t("notifications") || "Notifications",
      icon: BellIcon,
      isEnabled: true,
    },
    {
      id: "poi",
      path: routes.pointOfInterest,
      label: t("pois") || "Points of Interest",
      icon: MapPin,
      isEnabled: false,
    },
    {
      id: "trips",
      path: routes.trips,
      label: t("trips") || "Trips",
      icon: Map,
      isEnabled: false,
    },
    {
      id: "fun-days",
      path: routes.funDays,
      label: t("fun_days") || "Fun Days",
      icon: Sparkles,
      isEnabled: false,
    },
    {
      id: "local-economy",
      path: "#local_economy",
      label: t("local_economy") || "Local Economy",
      icon: Wallet,
      isEnabled: true,
      subItems: [
        {
          id: "vouchers",
          path: routes.voucherMgmt,
          label: t("vouchers") || "Vouchers",
          icon: Ticket,
          isEnabled: true,
        },
        {
          id: "offline-vouchers",
          path: routes.offlineVouchers,
          label: t("offline_vouchers") || "Offline Vouchers Purchases",
          icon: Receipt,
          isEnabled: false,
        },
        {
          id: "mini-campaign",
          path: routes.miniCampaign,
          label: t("mini_campaigns") || "Mini-Campaigns",
          icon: Megaphone,
          isEnabled: false,
        },
      ],
    },
    {
      id: "site-management",
      path: "#site_management",
      label: t("site_management") || "Site Management",
      icon: Globe,
      isEnabled: true,
      subItems: [
        {
          id: "content-mgmt",
          path: routes.contentMgmt,
          label: t("content_mgmt") || "Content Management",
          icon: Layers2,
          isEnabled: true,
        },
        {
          id: "promotions",
          path: routes.dashboard,
          label: t("promotions") || "Promotions",
          icon: Megaphone,
          isEnabled: false,
        },
        {
          id: "article",
          path: routes.articleMgmt,
          label: t("article") || "Article",
          icon: FileText,
          isEnabled: true,
        },
        {
          id: "news-feed",
          path: routes.dashboard,
          label: t("news_feed") || "News Feed",
          icon: Rss,
          isEnabled: false,
        },
        {
          id: "feed-settings",
          path: routes.dashboard,
          label: t("feed_settings") || "Feed Settings",
          icon: SlidersHorizontal,
          isEnabled: false,
        },
        {
          id: "mini-site",
          path: routes.dashboard,
          label: t("mini_site") || "Mini-site",
          icon: Layout,
          isEnabled: false,
        },
        {
          id: "website-settings",
          path: routes.websiteMgmt,
          label: t("website_settings") || "Website Settings",
          icon: Settings,
          isEnabled: true,
        },
      ],
    },
    {
      id: "settings",
      path: routes.profile,
      label: t("settings") || "Settings",
      icon: Settings,
      isEnabled: true,
      subItems: [
        {
          id: "profile",
          path: routes.profile,
          label: t("my_profile") || "My Profile",
          icon: UserCircle,
          isEnabled: true,
        },
        {
          id: "users",
          path: routes.dashboard,
          label: t("users") || "Users",
          icon: Users,
          isEnabled: false,
        },
        {
          id: "documents",
          path: routes.dashboard,
          label: t("documents") || "Documents",
          icon: File,
          isEnabled: false,
        },
      ],
    },
  ];

  const toggleExpanded = (path: string, itemId: string) => {
    const isCurrentlyExpanded = expandedItems.includes(path);
    setExpandedItems((prev) =>
      prev.includes(path)
        ? prev.filter((navPath) => navPath !== path)
        : [...prev, path],
    );
    if (!isCurrentlyExpanded) {
      setTimeout(() => {
        subItemsRefs.current[itemId]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 50);
    }
  };

  const handleItemClick = (item: MenuItem, hasSubItems: boolean) => {
    // Prevent navigation if item is disabled
    if (!item.isEnabled) {
      return;
    }

    if (hasSubItems) {
      toggleExpanded(item.path, item.id);
    }
    navigate(item.path);
  };

  const isItemActive = (path: string) =>
    location.pathname.slice(0, 5) === path.slice(0, 5);

  const isExpanded = (path: string) => expandedItems.includes(path);

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const Icon = item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const expanded = isExpanded(item.path);
    const active = isItemActive(item.path);
    const isDisabled = !item.isEnabled;

    const ChevronIcon = isRTL
      ? expanded
        ? ChevronDown
        : ChevronRight
      : expanded
        ? ChevronDown
        : ChevronRight;

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item, hasSubItems as boolean)}
          disabled={isDisabled}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
            level > 0 ? `${isRTL ? "pr-8" : "pl-8"}` : ""
          } ${
            isDisabled
              ? isDark
                ? "text-gray-600 cursor-not-allowed opacity-50"
                : "text-gray-400 cursor-not-allowed opacity-60"
              : active
                ? isDark
                  ? "bg-teal-500/20 text-teal-400 border-l-2 border-teal-500 cursor-pointer"
                  : "bg-teal-50 text-teal-700 border-l-2 border-teal-600 cursor-pointer"
                : isDark
                  ? "text-gray-300 hover:bg-gray-800/50 cursor-pointer"
                  : "text-gray-700 hover:bg-gray-100 cursor-pointer"
          } ${isSidebarCollapsed ? "justify-center" : ""}`}
        >
          <Icon
            className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} shrink-0`}
          />
          {!isSidebarCollapsed && (
            <>
              <span
                className={`flex-1 ${isRTL ? "text-right" : "text-left"} text-sm truncate`}
              >
                {item.label}
              </span>
              {hasSubItems && !isDisabled && (
                <ChevronIcon className="w-4 h-4 shrink-0" />
              )}
            </>
          )}
        </button>

        {/* Sub-items */}
        {!isSidebarCollapsed && hasSubItems && expanded && !isDisabled && (
          <div
            ref={(el) => {
              subItemsRefs.current[item.id] = el;
            }}
            className={`${isDark ? "bg-gray-900/30" : "bg-gray-50/50"}`}
          >
            {item.subItems!.map((subItem) =>
              renderMenuItem(subItem, level + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed
          top-20
          h-[calc(100vh-5rem)]
          ${isSidebarCollapsed ? "w-16" : "w-64"}
          transition-all duration-300
          flex flex-col
          border-r
          z-30
          ${
            isDark
              ? "bg-gray-900/50 border-gray-800"
              : "bg-white border-gray-200"
          }
          ${isRTL ? "right-0" : "left-0"}
        `}
      >
        {/* Toggle Button */}
        <div
          className={`p-4 border-b ${
            isDark ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <button
            onClick={() => dispatch(toggleSidebar())}
            className={`w-full cursor-pointer flex items-center justify-center p-2 rounded-lg transition-colors ${
              isDark
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems
            ?.map((item) => ({
              ...item,
              subItems: item.subItems?.filter(
                (sub) => !(isTraveller && sub.id === "content-mgmt"),
              ),
            }))
            ?.map((item) => renderMenuItem(item))}
        </nav>

        {/* Footer */}
        {!isSidebarCollapsed && (
          <div
            className={`p-4 border-t text-center ${
              isDark ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Powered by{" "}
              <span className="text-teal-600 dark:text-teal-400">
                MetGo LTD.
              </span>
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
              Contact support at{" "}
              <a
                href="mailto:support@metgo.app"
                className="text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors"
              >
                support@metgo.app
              </a>
              <span className="my-1 block">
                {t("version") || "Version"} 1.0.0
              </span>
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
