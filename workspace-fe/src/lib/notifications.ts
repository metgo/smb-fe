// utils/notifications.ts
interface Notification {
  id: string;
  type: "info" | "action" | "warning" | "error";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  relatedTo?: {
    module: string;
    id: string;
  };
}

export function generateMockNotifications(): Notification[] {
  const templates: Omit<Notification, "id" | "timestamp" | "read">[] = [
    {
      type: "action",
      title: "New business awaiting approval",
      description:
        "Desert Lodge Hotel has submitted their business profile for review",
      relatedTo: { module: "businesses", id: "biz-1" },
    },
    {
      type: "info",
      title: "Order completed",
      description: "Order #12345 has been completed and paid",
      relatedTo: { module: "orders", id: "order-1" },
    },
    {
      type: "warning",
      title: "Product stock running low",
      description: "Camel Desert Tour - only 3 spots remaining",
      relatedTo: { module: "products", id: "product-1" },
    },
    {
      type: "error",
      title: "Payment failed",
      description: "Payment processing error for order #12346",
      relatedTo: { module: "orders", id: "order-2" },
    },
    {
      type: "action",
      title: "Event needs approval",
      description: "Negev Music Festival 2025 is pending your review",
      relatedTo: { module: "events", id: "event-1" },
    },
    {
      type: "info",
      title: "New voucher issued",
      description: "10% discount voucher created for Summer Campaign",
      relatedTo: { module: "vouchers", id: "voucher-1" },
    },
    {
      type: "warning",
      title: "Trip capacity reached",
      description: "Ramon Crater Hiking Trip is now fully booked",
      relatedTo: { module: "trips", id: "trip-1" },
    },
    {
      type: "info",
      title: "New review posted",
      description:
        "A new 5-star review was posted for Be'er Sheva Wellness Spa",
      relatedTo: { module: "businesses", id: "biz-2" },
    },
  ];

  const notifications: Notification[] = [];

  for (let i = 0; i < 25; i++) {
    const template = templates[i % templates.length];
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);

    notifications.push({
      id: `notification-${i + 1}`,
      ...template,
      timestamp: new Date(
        Date.now() -
          daysAgo * 24 * 60 * 60 * 1000 -
          hoursAgo * 60 * 60 * 1000 -
          minutesAgo * 60 * 1000,
      ),
      read: Math.random() > 0.4, // 60% read, 40% unread
    });
  }

  return notifications.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );
}
