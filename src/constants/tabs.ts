import {
  Accessibility,
  Bell,
  Box,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Globe,
  ImageIcon,
  MapPin,
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
];

export const productTabs = [
  { id: "overview", label: "overview", icon: FileText },
  { id: "attributes", label: "attributes", icon: Accessibility },
  {
    id: "pricing",
    label: "pricing",
    icon: DollarSign,
  },
  { id: "inventory", label: "inventory", icon: Box },
  {
    id: "availability",
    label: "availability",
    icon: Calendar,
  },
  { id: "delivery", label: "delivery_policy", icon: Truck },
  { id: "media", label: "media", icon: ImageIcon },
];
