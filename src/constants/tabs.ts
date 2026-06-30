import {
  Accessibility,
  AlertTriangle,
  Bell,
  Box,
  Calendar,
  Clock,
  FileText,
  Globe,
  ImageIcon,
  LayoutList,
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
  { id: "location", label: "location_map", icon: MapPin },
  { id: "media", label: "images_branding", icon: ImageIcon },
  { id: "social", label: "social_networks", icon: Globe },
  { id: "delivery", label: "delivery_policy", icon: Truck },
  { id: "hours", label: "operating_hours", icon: Clock },
  // { id: "products", label: "products", icon: Package },
];

export const eventTabs = [
  { id: "overview", label: "overview", icon: FileText },
  { id: "attributes", label: "attributes", icon: Accessibility },
  { id: "date_time", label: "date_time", icon: Calendar },
  { id: "location", label: "location_map", icon: MapPin },
  { id: "media", label: "media", icon: ImageIcon },
  { id: "tickets", label: "tickets", icon: Ticket },
  { id: "registration", label: "registration", icon: Users },
  {
    id: "schedual_notification",
    label: "schedual_notification",
    icon: Bell,
  },
  { id: "sessions", label: "sessions", icon: LayoutList },
];

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
  { id: "location", label: "location_map", icon: MapPin },
  { id: "media", label: "images", icon: ImageIcon },
];

export const voucherTabs = [
  { id: "overview", label: "overview", icon: FileText },
  { id: "assignee", label: "assignee_and_creator", icon: Users },
  { id: "timeline", label: "usage_timeline", icon: Clock },
  { id: "transactions", label: "transactions_and_usage", icon: Truck },
];

export const crashTabs = [
  { id: "error", label: "Error", icon: AlertTriangle },
  { id: "stack", label: "Stack Trace", icon: FileText },
  { id: "user", label: "User", icon: Users },
  { id: "device", label: "Device & Browser", icon: Monitor },
];
