import type { MonthlyOrder } from "@/pages/vendor-reconcilation-mgmt/components/sub-components/VendorMonthlyReport";
const products = [
  {
    name: "Guided Desert Tour",
    price: 120,
    imageUrl:
      "https://images.unsplash.com/photo-1682687220640-9d3b11ca30e5?w=150&h=150&fit=crop",
    category: "Tour",
    sku: "TOUR-001",
  },
  {
    name: "Sunset Jeep Ride",
    price: 95,
    imageUrl:
      "https://images.unsplash.com/photo-1682687221175-fd40bbafe6e1?w=150&h=150&fit=crop",
    category: "Activity",
    sku: "ACT-002",
  },
  {
    name: "Bedouin Dinner Experience",
    price: 75,
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=150&h=150&fit=crop",
    category: "Dining",
    sku: "DIN-003",
  },
  {
    name: "Hotel Night Package",
    price: 180,
    imageUrl:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&h=150&fit=crop",
    category: "Accommodation",
    sku: "ACC-004",
  },
  {
    name: "Makhtesh Ramon Hike",
    price: 60,
    imageUrl:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=150&h=150&fit=crop",
    category: "Hike",
    sku: "HIK-005",
  },
  {
    name: "Wine Tasting Tour",
    price: 85,
    imageUrl:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=150&h=150&fit=crop",
    category: "Tour",
    sku: "TOUR-006",
  },
  {
    name: "Pottery Workshop",
    price: 45,
    imageUrl:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=150&h=150&fit=crop",
    category: "Workshop",
    sku: "WRK-007",
  },
  {
    name: "Camel Ride Adventure",
    price: 55,
    imageUrl:
      "https://images.unsplash.com/photo-1546412414-e1885259563a?w=150&h=150&fit=crop",
    category: "Activity",
    sku: "ACT-008",
  },
  {
    name: "Star Gazing Night",
    price: 70,
    imageUrl:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=150&h=150&fit=crop",
    category: "Activity",
    sku: "ACT-009",
  },
  {
    name: "Desert Camping Experience",
    price: 150,
    imageUrl:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=150&h=150&fit=crop",
    category: "Camping",
    sku: "CAMP-010",
  },
];

const customers = [
  {
    name: "David Cohen",
    email: "david.cohen@email.com",
    phone: "+972-50-1234567",
    location: "Tel Aviv",
  },
  {
    name: "Sarah Levi",
    email: "sarah.levi@email.com",
    phone: "+972-52-2345678",
    location: "Jerusalem",
  },
  {
    name: "Michael Ben-David",
    email: "michael.bd@email.com",
    phone: "+972-54-3456789",
    location: "Haifa",
  },
  {
    name: "Rachel Mizrahi",
    email: "rachel.m@email.com",
    phone: "+972-50-4567890",
    location: "Beersheba",
  },
  {
    name: "Jonathan Shapiro",
    email: "jon.shapiro@email.com",
    phone: "+972-52-5678901",
    location: "Eilat",
  },
  {
    name: "Emma Goldstein",
    email: "emma.gold@email.com",
    phone: "+972-54-6789012",
    location: "Tel Aviv",
  },
  {
    name: "Daniel Katz",
    email: "dan.katz@email.com",
    phone: "+972-50-7890123",
    location: "Netanya",
  },
  {
    name: "Olivia Rosenberg",
    email: "olivia.r@email.com",
    phone: "+972-52-8901234",
    location: "Herzliya",
  },
  {
    name: "Noah Friedman",
    email: "noah.f@email.com",
    phone: "+972-54-9012345",
    location: "Ramat Gan",
  },
  {
    name: "Sophia Klein",
    email: "sophia.klein@email.com",
    phone: "+972-50-0123456",
    location: "Ashdod",
  },
  {
    name: "Ethan Weiss",
    email: "ethan.weiss@email.com",
    phone: "+972-52-1234560",
    location: "Rishon LeZion",
  },
  {
    name: "Isabella Schwartz",
    email: "isabella.s@email.com",
    phone: "+972-54-2345601",
    location: "Petah Tikva",
  },
  {
    name: "James Stein",
    email: "james.stein@email.com",
    phone: "+972-50-3456012",
    location: "Holon",
  },
  {
    name: "Mia Bloom",
    email: "mia.bloom@email.com",
    phone: "+972-52-4560123",
    location: "Bat Yam",
  },
  {
    name: "Alexander Green",
    email: "alex.green@email.com",
    phone: "+972-54-5601234",
    location: "Rehovot",
  },
];

const deliveryMethods = [
  "Standard Shipping",
  "Express Delivery",
  "Pickup at Venue",
  "Digital Delivery",
];
const paymentMethods = [
  "Credit Card (****1234)",
  "Credit Card (****5678)",
  "PayPal",
  "Voucher + Card",
];
// const statuses: Array<'pending' | 'approved' | 'disputed' | 'cancelled'> = ['pending', 'approved', 'disputed', 'cancelled'];

const disputeReasons = [
  "Wrong item shipped",
  "Item damaged/defective",
  "Customer fraudulent claim",
  "Pricing error",
  "Quantity mismatch",
  "Payment issue",
  "Delivery problem",
];

const cancelReasons = [
  "Out of stock",
  "Unable to fulfill",
  "Customer requested cancellation",
  "Pricing error",
  "Duplicate order",
];

export function generateMockMonthlyOrders(
  count: number,
  vendorId: string,
): MonthlyOrder[] {
  return Array.from({ length: count }, (_, i) => {
    const product = products[Math.floor(Math.random() * products.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const totalPrice = product.price * quantity;
    const platformFee = totalPrice * 0.1; // 10% platform fee
    const netToVendor = totalPrice - platformFee;
    const purchaseDate = new Date(2026, 9, Math.floor(Math.random() * 28) + 1); // October 2026

    // Status distribution: 30% pending, 60% approved, 5% disputed, 5% cancelled
    const rand = Math.random();
    let status: "pending" | "approved" | "disputed" | "cancelled";
    if (rand < 0.3) {
      status = "pending";
    } else if (rand < 0.9) {
      status = "approved";
    } else if (rand < 0.95) {
      status = "disputed";
    } else {
      status = "cancelled";
    }

    const order: MonthlyOrder = {
      id: `ORD-${String(10000 + i).padStart(5, "0")}`,
      productId: `prod-${i}`,
      productName: product.name,
      productImage: product.imageUrl,
      productSKU: product.sku,
      productCategory: product.category,
      customerId: `cust-${i % customers.length}`,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerLocation: customer.location,
      purchaseDate: purchaseDate.toISOString(),
      quantity,
      unitPrice: product.price,
      totalPrice,
      platformFee,
      netToVendor,
      status,
      paymentMethod:
        paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      paymentStatus: "Completed",
      deliveryMethod:
        deliveryMethods[Math.floor(Math.random() * deliveryMethods.length)],
      deliveryAddress: `${Math.floor(Math.random() * 500) + 1} ${["Rothschild", "Dizengoff", "Ben Yehuda", "Allenby"][Math.floor(Math.random() * 4)]} St, ${customer.location}, Israel`,
      specialInstructions:
        Math.random() > 0.7 ? "Please call before delivery" : undefined,
      transactionId: `TXN-${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
    };

    // Add dispute info if status is disputed
    if (status === "disputed") {
      const reason =
        disputeReasons[Math.floor(Math.random() * disputeReasons.length)];
      const disputeDate = new Date(
        purchaseDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000,
      );

      order.disputeInfo = {
        id: `D-${Date.now()}-${i}`,
        reason,
        details: `This order has an issue with ${reason.toLowerCase()}. Customer reported problems and we need to resolve this matter.`,
        files: Math.random() > 0.5 ? ["evidence1.jpg", "evidence2.jpg"] : [],
        submittedAt: disputeDate.toISOString(),
        resolution: "pending",
      };

      // Some disputes have admin responses
      if (Math.random() > 0.5) {
        order.disputeInfo.adminResponse =
          "We are reviewing the evidence provided. Please allow 1-2 business days for resolution.";
        order.disputeInfo.respondedAt = new Date(
          disputeDate.getTime() + 24 * 60 * 60 * 1000,
        ).toISOString();
      }
    }

    // Add cancel info if status is cancelled
    if (status === "cancelled") {
      const reason =
        cancelReasons[Math.floor(Math.random() * cancelReasons.length)];
      const cancelDate = new Date(
        purchaseDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000,
      );

      order.cancelInfo = {
        reason,
        notes: "Cancellation processed and refund initiated.",
        cancelledAt: cancelDate.toISOString(),
        cancelledBy: "vendor-user",
      };
    }

    // Add approval info if status is approved
    if (status === "approved") {
      const approvalDate = new Date(
        purchaseDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000,
      );
      order.approvedAt = approvalDate.toISOString();
      order.approvedBy = "vendor-user";
    }

    return order;
  });
}
