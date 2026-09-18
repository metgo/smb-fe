import {
  Accessibility,
  AlertTriangle,
  Bell,
  Box,
  Calendar,
  Clock,
  FileText,
  Globe,
  History,
  ImageIcon,
  LayoutList,
  Logs,
  MapPin,
  Monitor,
  Ticket,
  Truck,
  Users,
} from "lucide-react";

export const businessTabs = [
  { id: "overview", label: "overview", icon: FileText },
  {
    id: "accessibility",
    label: "attributes",
    icon: Accessibility,
  },
  { id: "contact", label: "contact_ownership", icon: Users },
  { id: "media", label: "images_branding", icon: ImageIcon },
  { id: "social", label: "social_networks", icon: Globe },
  { id: "delivery", label: "delivery_policy", icon: Truck },
  { id: "hours", label: "operating_hours", icon: Clock },
];
export const miniSiteTabs = [
  { id: "overview", label: "overview", icon: FileText },
  { id: "preview", label: "preview", icon: Monitor },
  { id: "voucher_list", label: "Vouchers", icon: Ticket },
  { id: "audit_info", label: "audit_info", icon: History },
];
export const eventTabs = [
  { id: "overview", label: "overview", icon: FileText },
  { id: "sessions", label: "landing_pages", icon: LayoutList },
  { id: "attributes", label: "attributes", icon: Accessibility },
  { id: "date_time", label: "date_time", icon: Calendar },
  { id: "media", label: "media", icon: ImageIcon },
  { id: "tickets", label: "tickets", icon: Ticket },
  { id: "registration", label: "registration", icon: Users },
  {
    id: "schedual_notification",
    label: "schedual_notification",
    icon: Bell,
  },
  { id: "qr_scan_logs", label: "qr_scan_logs", icon: Logs },
];

export const getEventTabs = (hasExternalTicket?: boolean) => {
  return eventTabs.filter((tab) => {
    if (hasExternalTicket) {
      return tab.id !== "sessions" && tab.id !== "registration";
    }
    return true;
  });
};

export const productTabs = [
  { id: "overview", label: "overview", icon: FileText },
  { id: "attributes", label: "attributes", icon: Accessibility },
  { id: "pricing_inventory", label: "inventory", icon: Box },
  {
    id: "availability",
    label: "availability",
    icon: Calendar,
  },
  { id: "delivery", label: "delivery_policy", icon: Truck },
  { id: "media", label: "media", icon: ImageIcon },
];

export const poiTabs = [
  { id: "overview", label: "overview", icon: FileText },
  { id: "accessibility", label: "attributes", icon: Accessibility },
  { id: "media", label: "images", icon: ImageIcon },
];

export const tripTabs = [
  { id: "overview", label: "overview", icon: FileText },
  { id: "stations", label: "stations", icon: MapPin },
  { id: "itenary", label: "step_itenary", icon: Clock },
  { id: "media", label: "media", icon: ImageIcon },
];

export const voucherTabs = [
  { id: "overview", label: "overview", icon: FileText },
  { id: "assignee", label: "assignee_and_creator", icon: Users },
  { id: "transactions", label: "transactions_and_usage", icon: Truck },
];

export const crashTabs = [
  { id: "error", label: "Error", icon: AlertTriangle },
  { id: "stack", label: "Stack Trace", icon: FileText },
  { id: "user", label: "User", icon: Users },
  { id: "device", label: "Device & Browser", icon: Monitor },
];
