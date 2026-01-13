import { useState } from 'react';
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
  Home,
  Megaphone,
  FileText,
  Rss,
  SlidersHorizontal,
  Layout,
  Users,
  File,
  UserCircle
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { useTranslation } from 'react-i18next';
import { toggleSidebar } from '@/features/uiSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import { routes } from '@/lib/routes';


interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  subItems?: MenuItem[];
}

export default function Sidebar() {
  const { t } = useTranslation("common");
  const navigate = useNavigate()
  const location = useLocation();

  const dispatch = useAppDispatch()

  const { theme, isRTL } = useAppSelector((state) => state.settings)
  const { isSidebarCollapsed, } = useAppSelector((state => state.ui))

  const [isMobileOpen, setIsMobileOpen] = useState(false);


  const [expandedItems, setExpandedItems] = useState<string[]>([]);



  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      path: routes.dashboard,
      label: t('dashboard') || 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'businesses',
      path: routes.businessMgmt,
      label: t('businesses') || 'Businesses',
      icon: Building2,
    },
    {
      id: 'products',
      path: routes.productsMgmt,
      label: t('products') || 'Products',
      icon: Package,
    },
    {
      id: 'orders',
      path: routes.ordersMgmt,
      label: t('orders') || 'Orders',
      icon: ShoppingCart,
    },
    {
      id: 'events',
      path: routes.eventsMgmt,
      label: t('events') || 'Events',
      icon: Calendar,
    },
    {
      id: 'poi',
      path: routes.pointOfInterest,
      label: t('pois') || 'Points of Interest',
      icon: MapPin,
    },
    {
      id: 'trips',
      path: routes.trips,
      label: t('trips') || 'Trips',
      icon: Map,
    },
    {
      id: 'fun-days',
      path: routes.funDays,
      label: t('fun_days') || 'Fun Days',
      icon: Sparkles,
    },
    {
      id: 'local-economy',
      path: routes.miniCampaign,
      label: t('local_economy') || 'Local Economy',
      icon: Wallet,
      subItems: [
        { id: 'vouchers', path: routes.vouchers, label: t('vouchers') || 'Vouchers', icon: Ticket },
        { id: 'offline-vouchers', path: routes.offlineVouchers, label: t('offline_vouchers') || 'Offline Vouchers Purchases', icon: Receipt },
        { id: 'mini-campaign', path: routes.miniCampaign, label: t('mini_campaigns') || 'Mini-Campaigns', icon: Megaphone },
      ],
    },
    {
      id: 'site-management',
      path: routes.dashboard,
      label: t('site_management') || 'Site Management',
      icon: Globe,
      subItems: [
        { id: 'home', path: routes.dashboard, label: t('home') || 'Home', icon: Home },
        { id: 'promotions', path: routes.dashboard, label: t('promotions') || 'Promotions', icon: Megaphone },
        { id: 'blog', path: routes.dashboard, label: t('blog') || 'Blog', icon: FileText },
        { id: 'news-feed', path: routes.dashboard, label: t('news_feed') || 'News Feed', icon: Rss },
        { id: 'feed-settings', path: routes.dashboard, label: t('feed_settings') || 'Feed Settings', icon: SlidersHorizontal },
        { id: 'mini-site', path: routes.dashboard, label: t('mini_site') || 'Mini-site', icon: Layout },
      ],
    },
    {
      id: 'settings',
      path: routes.profile,
      label: t('settings') || 'Settings',
      icon: Settings,
      subItems: [
        { id: 'profile', path: routes.profile, label: t('my_profile') || 'My Profile', icon: UserCircle },
        { id: 'users', path: routes.dashboard, label: t('users') || 'Users', icon: Users },
        { id: 'documents', path: routes.dashboard, label: t('documents') || 'Documents', icon: File },
      ],
    },
  ];

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev =>
      prev.includes(path)
        ? prev.filter(navPath => navPath !== path)
        : [...prev, path]
    );
  };

  const handleItemClick = (path: string, hasSubItems: boolean) => {
    if (hasSubItems) {
      toggleExpanded(path);
    }
    navigate(path)
  };

  const isItemActive = (path: string) => location.pathname === path;
  const isExpanded = (path: string) => expandedItems.includes(path);

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const Icon = item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const expanded = isExpanded(item.path);
    const active = isItemActive(item.path);

    const ChevronIcon = isRTL ? (expanded ? ChevronDown : ChevronRight) : (expanded ? ChevronDown : ChevronRight);


    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item.path, hasSubItems as boolean)}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-all cursor-pointer ${level > 0 ? `${isRTL ? 'pr-8' : 'pl-8'}` : ''
            } ${active
              ? theme === 'dark'
                ? 'bg-teal-500/20 text-teal-400 border-l-2 border-teal-500'
                : 'bg-teal-50 text-teal-700 border-l-2 border-teal-600'
              : theme === 'dark'
                ? 'text-gray-300 hover:bg-gray-800/50'
                : 'text-gray-700 hover:bg-gray-100'
            } ${isSidebarCollapsed ? 'justify-center' : ''} ${isRTL && !isSidebarCollapsed ? 'flex-row-reverse' : ''}`}
        >
          <Icon className={`${isSidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4'} shrink-0`} />
          {!isSidebarCollapsed && (
            <>
              <span className={`flex-1 ${isRTL ? 'text-right' : 'text-left'} text-sm truncate`}>{item.label}</span>
              {hasSubItems && (
                <ChevronIcon className="w-4 h-4 shrink-0" />
              )}
            </>
          )}
        </button>

        {/* Sub-items */}
        {!isSidebarCollapsed && hasSubItems && expanded && (
          <div className={`${theme === 'dark' ? 'bg-gray-900/30' : 'bg-gray-50/50'
            }`}>
            {item.subItems!.map(subItem => renderMenuItem(subItem, level + 1))}
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
      {/* <aside
        className={`${isSidebarCollapsed ? 'w-16' : 'w-64'
          } db1 h-[calc(100vh-5rem)] top-20 transition-all duration-300 flex flex-col border-r fixed top-20 bottom-0 left-0 z-30 ${theme === 'dark'
            ? 'bg-gray-900/50 border-gray-800'
            : 'bg-white border-gray-200'
          } ${
          // Mobile: fixed overlay with transform, Desktop: always fixed
          isMobileOpen !== undefined
            ? `lg:static ${isRTL ? 'right-0 left-auto' : 'left-0'} transform lg:transform-none ${isMobileOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
            } lg:translate-x-0`
            : ''
          }`}
      > */}
      <aside
        className={`
          fixed
          top-20
          h-[calc(100vh-5rem)]
          ${isSidebarCollapsed ? 'w-16' : 'w-64'}
          transition-all duration-300
          flex flex-col
          border-r
          z-30
          ${theme === 'dark'
                  ? 'bg-gray-900/50 border-gray-800'
                  : 'bg-white border-gray-200'
                }
          ${isRTL ? 'right-0' : 'left-0'}
        `}
      >
        {/* Toggle Button */}
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className={`w-full cursor-pointer flex items-center justify-center p-2 rounded-lg transition-colors ${theme === 'dark'
              ? 'hover:bg-gray-800 text-gray-300'
              : 'hover:bg-gray-100 text-gray-700'
              }`}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>

        {/* Footer */}
        {!isSidebarCollapsed && (
          <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
            }`}>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}>
              <p className="mb-1">{t('version') || 'Version'} 1.0.0</p>
              <p className="text-teal-500">MetGo LTD.</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}