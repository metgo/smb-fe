import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  ShoppingCart,
  Calendar,
  UserCircle,
  Menu,
} from "lucide-react";

import { routes } from "@/lib/routes";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { toggleMobileSidebar } from "@/features/uiSlice";
import { useThemeClasses } from "@/hooks/useThemeClasses";

export default function MobileBottomNav() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { isDark } = useThemeClasses();
  const userRole = useAppSelector((state) => state.auth.userRole);

  // Orders endpoints currently only allow superadmin/traveller (backend @Roles) —
  // dmo/authority roles would only hit 403s, so fall back to the Events page.
  const isDmoOrAuthorityRole = ["dmo", "authority"].includes(userRole);

  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrolledDown = currentScrollY > lastScrollY.current;
      const scrolledEnough = Math.abs(currentScrollY - lastScrollY.current) > 8;

      if (scrolledEnough) {
        setVisible(!scrolledDown || currentScrollY < 32);
        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    {
      id: "profile",
      label: t("my_profile") || "Profile",
      icon: UserCircle,
      path: routes.profile,
    },
    {
      id: "orders",
      label: t("orders") || "Orders",
      icon: isDmoOrAuthorityRole ? Calendar : ShoppingCart,
      path: isDmoOrAuthorityRole ? routes.eventsMgmt : routes.ordersMgmt,
    },

    {
      id: "businesses",
      label: t("businesses") || "Businesses",
      icon: Building2,
      path: routes.businessMgmt,
    },
    {
      id: "dashboard",
      label: t("dashboard") || "Dashboard",
      icon: LayoutDashboard,
      path: routes.dashboard,
    },
  ];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <nav
      className={clsx(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t transition-transform duration-300",
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="flex items-center justify-around h-16">
        <button
          onClick={() => dispatch(toggleMobileSidebar())}
          aria-label={t("more") || "More"}
          className={clsx(
            "flex-1 h-full flex items-center justify-center",
            isDark ? "text-gray-400" : "text-gray-500",
          )}
        >
          <Menu className="w-6 h-6" />
        </button>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              className={clsx(
                "flex-1 h-full flex items-center justify-center",
                active
                  ? "text-teal-500"
                  : isDark
                    ? "text-gray-400"
                    : "text-gray-500",
              )}
            >
              <Icon className="w-6 h-6" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
