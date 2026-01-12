import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search, Filter, Download, Plus, ChevronDown, ChevronUp,
  MoreVertical, Check, X, Eye, Edit, Archive, CheckCircle, XCircle,
  Loader, AlertCircle, Columns, ExternalLink, Mail, Phone, QrCode,
  CreditCard, Ticket, Building2, MapPin, Package, Calendar,
  Truck, ShoppingBag, FileText, MessageSquare, Clock, User,
  DollarSign, TrendingUp, TrendingDown, Camera, ShoppingCart
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/hooks';

interface OnlineOrdersManagementProps {
  theme: Theme;
}

// Simulate user role for permissions
const USER_ROLE = 'admin'; // Can be: 'admin', 'vendor', 'dmo', 'authority'

// Order interface
interface Order {
  id: string;
  purchaserName: string;
  email: string;
  phone: string;
  orderType: 'online' | 'offline';
  orderStatus: 'draft' | 'processing' | 'paid' | 'confirmed' | 'delivered' | 'completed' | 'cancelled' | 'partially_cancelled' | 'failed';
  paymentStatus: 'pending' | 'success' | 'failed' | 'refunded' | 'partially_refunded';
  paymentMethod: string[];
  totalAmount: number;
  voucherAmount: number;
  creditCardAmount: number;
  vendors: string[];
  campaign: string;
  deliveryType: 'pickup' | 'delivery' | 'digital';
  createdDate: string;
  paymentDate: string;
  products: OrderProduct[];
  address?: string;
  campaignCode?: string;
  qrScanned: boolean;
  deliveryFee: number;
}

interface OrderProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  vendor: string;
  deliveryType: 'pickup' | 'delivery';
  imageUrl: string;
  description: string;
  category: string;
  cancelled?: boolean;
}

// Mock data generator
const generateMockOrders = (count: number): Order[] => {
  const statuses: Order['orderStatus'][] = ['draft', 'processing', 'paid', 'confirmed', 'delivered', 'completed', 'cancelled', 'partially_cancelled', 'failed'];
  const paymentStatuses: Order['paymentStatus'][] = ['pending', 'success', 'failed', 'refunded', 'partially_refunded'];
  const deliveryTypes: Order['deliveryType'][] = ['pickup', 'delivery', 'digital'];
  const vendors = ['Beersheba Bistro', 'Desert Delight', 'Negev Tours', 'Arad Adventures', 'Mitzpe Ramon Resort'];
  const campaigns = ['Summer Sale 2026', 'Desert Discovery', 'Family Fun Days', 'Food Festival', 'Adventure Week'];

  const products = [
    { name: 'Guided Desert Tour', price: 120, imageUrl: 'https://via.placeholder.com/150', description: 'Explore the desert with a professional guide.', category: 'Tour' },
    { name: 'Sunset Jeep Ride', price: 95, imageUrl: 'https://via.placeholder.com/150', description: 'Experience the sunset in a Jeep.', category: 'Activity' },
    { name: 'Bedouin Dinner Experience', price: 75, imageUrl: 'https://via.placeholder.com/150', description: 'Enjoy a traditional Bedouin dinner.', category: 'Dinner' },
    { name: 'Hotel Night Package', price: 180, imageUrl: 'https://via.placeholder.com/150', description: 'Stay overnight in a luxurious hotel.', category: 'Accommodation' },
    { name: 'Makhtesh Ramon Hike', price: 60, imageUrl: 'https://via.placeholder.com/150', description: 'Hike through the Makhtesh Ramon.', category: 'Hike' },
    { name: 'Wine Tasting Tour', price: 85, imageUrl: 'https://via.placeholder.com/150', description: 'Sample local wines on a guided tour.', category: 'Tour' },
    { name: 'Pottery Workshop', price: 45, imageUrl: 'https://via.placeholder.com/150', description: 'Create pottery pieces in a hands-on workshop.', category: 'Workshop' },
  ];

  return Array.from({ length: count }, (_, i) => {
    const orderProducts: OrderProduct[] = Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      (_, j) => {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 3) + 1;
        return {
          id: `prod-${i}-${j}`,
          name: product.name,
          quantity: qty,
          unitPrice: product.price,
          vendor: vendors[Math.floor(Math.random() * vendors.length)],
          deliveryType: Math.random() > 0.5 ? 'pickup' : 'delivery',
          imageUrl: product.imageUrl,
          description: product.description,
          category: product.category,
        };
      }
    );

    const totalAmount = orderProducts.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
    const voucherPortion = Math.random() > 0.3 ? Math.floor(totalAmount * (Math.random() * 0.5)) : 0;
    const deliveryFee = orderProducts.some(p => p.deliveryType === 'delivery') ? 15 : 0;

    return {
      id: `ORD-${String(10000 + i).padStart(5, '0')}`,
      purchaserName: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      phone: `+972-50-${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`,
      orderType: Math.random() > 0.5 ? 'online' : 'offline',
      orderStatus: statuses[Math.floor(Math.random() * statuses.length)],
      paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      paymentMethod: voucherPortion > 0 ? ['voucher', 'credit_card'] : ['credit_card'],
      totalAmount: totalAmount + deliveryFee,
      voucherAmount: voucherPortion,
      creditCardAmount: totalAmount - voucherPortion,
      vendors: [...new Set(orderProducts.map(p => p.vendor))],
      campaign: campaigns[Math.floor(Math.random() * campaigns.length)],
      deliveryType: deliveryTypes[Math.floor(Math.random() * deliveryTypes.length)],
      createdDate: new Date(2026, 0, Math.floor(Math.random() * 30) + 1).toISOString(),
      paymentDate: new Date(2026, 0, Math.floor(Math.random() * 30) + 1).toISOString(),
      products: orderProducts,
      address: Math.random() > 0.5 ? '123 Main St, Beersheba' : undefined,
      campaignCode: `CAMP${Math.floor(Math.random() * 1000)}`,
      qrScanned: Math.random() > 0.5,
      deliveryFee,
    };
  });
};

// Default columns configuration
const defaultColumns = {
  orderId: true,
  purchaserName: true,
  email: true,
  phone: true,
  orderStatus: true,
  totalAmount: true,
  paymentStatus: false,
  voucherAmount: false,
  creditCardAmount: false,
  vendors: false,
  campaign: false,
  createdDate: false,
  paymentDate: false,
};

type ColumnVisibility = typeof defaultColumns;

export default function OnlineOrdersManagement({ theme }: OnlineOrdersManagementProps) {
  const { t } = useTranslation('orders');
  const { isRTL } = useAppSelector((state) => state.settings)
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAddOrderWizard, setShowAddOrderWizard] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const columnSettingsRef = useRef<HTMLDivElement>(null);

  // Text color utilities
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const textTertiary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  // Filters
  const [filters, setFilters] = useState({
    orderType: 'all',
    paymentMethod: 'all',
    vendor: 'all',
    campaign: 'all',
    deliveryType: 'all',
    dateFrom: '',
    dateTo: '',
    month: 'all', // 'all', 'MM-YYYY', or 'custom'
  });

  // Column visibility
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(defaultColumns);

  // Load mock data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setOrders(generateMockOrders(100));
      setLoading(false);
    }, 800);
  }, []);

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          order.id.toLowerCase().includes(search) ||
          order.purchaserName.toLowerCase().includes(search) ||
          order.email.toLowerCase().includes(search) ||
          order.phone.includes(search);
        if (!matchesSearch) return false;
      }

      // Status filters
      if (filters.orderType !== 'all' && order.orderType !== filters.orderType) return false;
      if (filters.deliveryType !== 'all' && order.deliveryType !== filters.deliveryType) return false;
      if (filters.paymentMethod !== 'all' && !order.paymentMethod.includes(filters.paymentMethod)) return false;
      if (filters.vendor !== 'all' && !order.vendors.includes(filters.vendor)) return false;
      if (filters.campaign !== 'all' && order.campaign !== filters.campaign) return false;

      // Month filter
      if (filters.month !== 'all' && filters.month !== 'custom') {
        const orderDate = new Date(order.createdDate);
        const orderMonth = `${String(orderDate.getMonth() + 1).padStart(2, '0')}-${orderDate.getFullYear()}`;
        if (orderMonth !== filters.month) return false;
      }

      // Custom date range filter
      if (filters.month === 'custom') {
        if (filters.dateFrom) {
          const orderDate = new Date(order.createdDate);
          const fromDate = new Date(filters.dateFrom);
          if (orderDate < fromDate) return false;
        }
        if (filters.dateTo) {
          const orderDate = new Date(order.createdDate);
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999); // Include the entire day
          if (orderDate > toDate) return false;
        }
      }

      return true;
    });
  }, [orders, searchTerm, filters]);

  // Statistics
  const statistics = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const pickups = filteredOrders.filter(o => o.deliveryType === 'pickup').length;
    const deliveries = filteredOrders.filter(o => o.deliveryType === 'delivery').length;
    const paidOrders = filteredOrders.filter(o => o.paymentStatus === 'success').length;
    const cancelledOrders = filteredOrders.filter(o => o.orderStatus === 'cancelled').length;

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      pickups,
      deliveries,
      paidOrders,
      cancelledOrders,
    };
  }, [filteredOrders]);

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleExportCSV = () => {
    // Determine which orders to export (selected or all filtered)
    const ordersToExport = selectedOrders.size > 0
      ? filteredOrders.filter(order => selectedOrders.has(order.id))
      : filteredOrders;

    if (ordersToExport.length === 0) {
      alert(t.noOrdersToExport || 'No orders to export');
      return;
    }

    // Helper function to escape CSV values
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Build CSV header based on visible columns
    const headers: string[] = [];
    const columnKeys: string[] = [];

    if (columnVisibility.orderId) {
      headers.push(t.orderId || 'Order ID');
      columnKeys.push('orderId');
    }
    if (columnVisibility.purchaserName) {
      headers.push(t.purchaserName || 'Purchaser');
      columnKeys.push('purchaserName');
    }
    if (columnVisibility.email) {
      headers.push(t.email || 'Email');
      columnKeys.push('email');
    }
    if (columnVisibility.phone) {
      headers.push(t.phone || 'Phone');
      columnKeys.push('phone');
    }
    if (columnVisibility.orderStatus) {
      headers.push(t.orderStatus || 'Status');
      columnKeys.push('orderStatus');
    }
    if (columnVisibility.totalAmount) {
      headers.push(t.totalAmount || 'Total');
      columnKeys.push('totalAmount');
    }
    if (columnVisibility.paymentStatus) {
      headers.push(t.paymentStatus || 'Payment');
      columnKeys.push('paymentStatus');
    }
    if (columnVisibility.voucherAmount) {
      headers.push(t.voucherAmount || 'Voucher');
      columnKeys.push('voucherAmount');
    }
    if (columnVisibility.creditCardAmount) {
      headers.push(t.creditCardAmount || 'Card');
      columnKeys.push('creditCardAmount');
    }
    if (columnVisibility.vendors) {
      headers.push(t.vendors || 'Vendors');
      columnKeys.push('vendors');
    }
    if (columnVisibility.campaign) {
      headers.push(t.campaign || 'Campaign');
      columnKeys.push('campaign');
    }
    if (columnVisibility.createdDate) {
      headers.push(t.createdDate || 'Created');
      columnKeys.push('createdDate');
    }
    if (columnVisibility.paymentDate) {
      headers.push(t.paymentDate || 'Paid');
      columnKeys.push('paymentDate');
    }

    // Build CSV content
    let csvContent = headers.map(escapeCSV).join(',') + '\n';

    ordersToExport.forEach(order => {
      const row: string[] = [];

      columnKeys.forEach(key => {
        if (key === 'orderId') {
          row.push(escapeCSV(order.id));
        } else if (key === 'purchaserName') {
          row.push(escapeCSV(order.purchaserName));
        } else if (key === 'email') {
          row.push(escapeCSV(order.email));
        } else if (key === 'phone') {
          row.push(escapeCSV(order.phone));
        } else if (key === 'orderStatus') {
          row.push(escapeCSV(order.orderStatus));
        } else if (key === 'totalAmount') {
          row.push(escapeCSV(`₪${order.totalAmount}`));
        } else if (key === 'paymentStatus') {
          row.push(escapeCSV(order.paymentStatus));
        } else if (key === 'voucherAmount') {
          row.push(escapeCSV(`₪${order.voucherAmount}`));
        } else if (key === 'creditCardAmount') {
          row.push(escapeCSV(`₪${order.creditCardAmount}`));
        } else if (key === 'vendors') {
          row.push(escapeCSV(order.vendors.join(', ')));
        } else if (key === 'campaign') {
          row.push(escapeCSV(order.campaign));
        } else if (key === 'createdDate') {
          row.push(escapeCSV(new Date(order.createdDate).toLocaleDateString()));
        } else if (key === 'paymentDate') {
          row.push(escapeCSV(new Date(order.paymentDate).toLocaleDateString()));
        }
      });

      csvContent += row.join(',') + '\n';
    });

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 10);

    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportXLS = () => {
    console.log('Exporting XLS...');
    // XLS export logic
  };

  const handleResendOrderDetails = () => {
    const ordersToResend = selectedOrders.size > 0
      ? orders.filter(order => selectedOrders.has(order.id))
      : [];

    if (ordersToResend.length === 0) {
      alert(t.noOrdersSelected || 'No orders selected');
      return;
    }

    // Simulate sending order details via email
    console.log('Resending order details for:', ordersToResend.map(o => o.id));

    // In a real implementation, this would call an API to send emails
    ordersToResend.forEach(order => {
      console.log(`Sending order details to ${order.email} for order ${order.id}`);
    });

    // Show success message
    const message = ordersToResend.length === 1
      ? `${t.orderDetailsSent || 'Order details sent to'} ${ordersToResend[0].email}`
      : `${t.orderDetailsSent || 'Order details sent to'} ${ordersToResend.length} ${t.customers || 'customers'}`;

    alert(message);

    // Clear selection after sending
    setSelectedOrders(new Set());
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnSettingsRef.current && !columnSettingsRef.current.contains(event.target as Node)) {
        setShowColumnSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Status badge helper
  const getOrderStatusBadge = (status: Order['orderStatus']) => {
    const badges = {
      draft: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300', label: t.draft || 'Draft' },
      processing: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-400', label: t.processing || 'Processing' },
      paid: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', label: t.paid || 'Paid' },
      confirmed: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-800 dark:text-teal-400', label: t.confirmed || 'Confirmed' },
      delivered: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-400', label: t.delivered || 'Delivered' },
      completed: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-800 dark:text-emerald-400', label: t.completed || 'Completed' },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', label: t.cancelled || 'Cancelled' },
      partially_cancelled: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-400', label: t.partiallyCancelled || 'Partially Cancelled' },
      failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', label: t.failed || 'Failed' },
    };
    const badge = badges[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: Order['paymentStatus']) => {
    const badges = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400', label: t.pending || 'Pending' },
      success: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', label: t.success || 'Success' },
      failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', label: t.failed || 'Failed' },
      refunded: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-400', label: t.refunded || 'Refunded' },
      partially_refunded: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-400', label: t.partiallyRefunded || 'Partially Refunded' },
    };
    const badge = badges[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className={`p-6 max-w-[1600px] mx-auto ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Page Header */}
      <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div>
          <h1 className={`text-2xl ${textPrimary}`}>{t.onlineOrdersManagement || 'Orders'}</h1>
          <p className={`text-sm ${textTertiary} mt-1`}>{t.onlineOrdersSubtitle || 'Manage, track, and fulfill customer orders'}</p>
        </div>
        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={() => setShowQRScanner(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${theme === 'dark'
                ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
              }`}
            title={t.scanQRCode || 'Scan QR Code'}
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddOrderWizard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addOrder || 'Add Order'}</span>
          </button>
        </div>
      </div>

      {/* Statistics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {/* Total Orders */}
        <div
          onClick={() => { }}
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className={`text-sm ${textPrimary}`}>{t.totalOrders || 'Total Orders'}</span>
          </div>
          <p className={`text-2xl ${textPrimary} mb-1`}>{statistics.totalOrders.toLocaleString()}</p>
          <p className={`text-xs ${textTertiary}`}>{t.all || 'All'}</p>
        </div>

        {/* Revenue */}
        <div
          onClick={() => { }}
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-md">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className={`text-sm ${textPrimary}`}>{t.revenue || 'Revenue'}</span>
          </div>
          <p className={`text-2xl ${textPrimary} mb-1`}>₪{statistics.totalRevenue.toLocaleString()}</p>
          <p className={`text-xs ${textTertiary}`}>{t.gross || 'Gross'}</p>
        </div>

        {/* Avg Order Value */}
        <div
          onClick={() => { }}
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className={`text-sm ${textPrimary}`}>{t.avgOrderValue || 'Avg Order Value'}</span>
          </div>
          <p className={`text-2xl ${textPrimary} mb-1`}>₪{Math.round(statistics.avgOrderValue).toLocaleString()}</p>
          <p className={`text-xs ${textTertiary}`}>{t.perOrder || 'Per Order'}</p>
        </div>

        {/* Pickups */}
        <div
          onClick={() => { }}
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className={`text-sm ${textPrimary}`}>{t.pickups || 'Pickups'}</span>
          </div>
          <p className={`text-2xl ${textPrimary} mb-1`}>{statistics.pickups.toLocaleString()}</p>
          <p className={`text-xs ${textTertiary}`}>{t.orders || 'Orders'}</p>
        </div>

        {/* Deliveries */}
        <div
          onClick={() => { }}
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 shadow-md">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className={`text-sm ${textPrimary}`}>{t.deliveries || 'Deliveries'}</span>
          </div>
          <p className={`text-2xl ${textPrimary} mb-1`}>{statistics.deliveries.toLocaleString()}</p>
          <p className={`text-xs ${textTertiary}`}>{t.orders || 'Orders'}</p>
        </div>

        {/* Cancelled Orders */}
        <div
          onClick={() => { }}
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-red-500 to-red-600 shadow-md">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <span className={`text-sm ${textPrimary}`}>{t.cancelledOrders || 'Cancelled'}</span>
          </div>
          <p className={`text-2xl ${textPrimary} mb-1`}>{statistics.cancelledOrders.toLocaleString()}</p>
          <p className={`text-xs ${textTertiary}`}>{t.cancelled || 'Cancelled'}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`${theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'
        } border rounded-lg p-4 mb-6`}>
        <div className={`flex flex-col md:flex-row gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 ${textTertiary}`} />
            <input
              type="text"
              placeholder={t.searchOrders || 'Search by Order ID, Name, Email, Phone...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 text-right' : 'pl-10'} py-2 rounded-lg border transition-colors ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
            />
          </div>

          {/* Download CSV Button */}
          <button
            onClick={handleExportCSV}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${theme === 'dark'
                ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
              }`}
            title={t.downloadCSV || 'Download CSV'}
          >
            <Download className="w-4 h-4" />
            <span>{t.downloadCSV || 'Download CSV'}</span>
          </button>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${theme === 'dark'
                ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
              }`}
          >
            <Filter className="w-4 h-4" />
            <span>{t.filters || 'Filters'}</span>
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Column Settings */}
          <div className="relative" ref={columnSettingsRef}>
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${theme === 'dark'
                  ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                }`}
            >
              <Columns className="w-4 h-4" />
              <span>{t.columns || 'Columns'}</span>
            </button>

            {showColumnSettings && (
              <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-64 rounded-lg shadow-lg border z-10 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                <div className="p-3 max-h-96 overflow-y-auto">
                  {Object.entries(columnVisibility).map(([key, visible]) => (
                    <label key={key} className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={(e) => setColumnVisibility(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="rounded"
                      />
                      <span className={`text-sm ${textSecondary}`}>{t[key] || key}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <FilterSelect
              label={t.orderType || 'Order Type'}
              value={filters.orderType}
              onChange={(value) => setFilters(prev => ({ ...prev, orderType: value }))}
              options={[
                { value: 'all', label: t.all || 'All' },
                { value: 'online', label: t.online || 'Online' },
                { value: 'offline', label: t.offline || 'Offline' },
              ]}
              theme={theme}
              isRTL={isRTL}
            />
            <FilterSelect
              label={t.deliveryType || 'Delivery Type'}
              value={filters.deliveryType}
              onChange={(value) => setFilters(prev => ({ ...prev, deliveryType: value }))}
              options={[
                { value: 'all', label: t.all || 'All' },
                { value: 'pickup', label: t.pickup || 'Pickup' },
                { value: 'delivery', label: t.delivery || 'Delivery' },
                { value: 'digital', label: t.digital || 'Digital' },
              ]}
              theme={theme}
              isRTL={isRTL}
            />
            <FilterSelect
              label={t.paymentMethod || 'Payment Method'}
              value={filters.paymentMethod}
              onChange={(value) => setFilters(prev => ({ ...prev, paymentMethod: value }))}
              options={[
                { value: 'all', label: t.all || 'All' },
                { value: 'voucher', label: t.voucher || 'Voucher' },
                { value: 'credit_card', label: t.creditCard || 'Credit Card' },
              ]}
              theme={theme}
              isRTL={isRTL}
            />
            <MonthFilter
              label={t.month || 'Month'}
              value={filters.month}
              onChange={(value) => setFilters(prev => ({ ...prev, month: value }))}
              dateFrom={filters.dateFrom}
              dateTo={filters.dateTo}
              onDateFromChange={(value) => setFilters(prev => ({ ...prev, dateFrom: value }))}
              onDateToChange={(value) => setFilters(prev => ({ ...prev, dateTo: value }))}
              theme={theme}
              isRTL={isRTL}
              t={t}
            />
          </div>
        )}
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedOrders.size > 0 && (
        <div className={`${theme === 'dark' ? 'bg-teal-900/30 border-teal-800' : 'bg-teal-50 border-teal-200'
          } border rounded-lg p-4 mb-4 flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className={`${textPrimary}`}>
            {selectedOrders.size} {t.selected || 'selected'}
          </span>
          <button
            onClick={handleResendOrderDetails}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${theme === 'dark'
                ? 'bg-blue-800 hover:bg-blue-700 text-blue-100'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
          >
            <Mail className="w-4 h-4" />
            <span className="text-sm">{t.resendOrderDetails || 'Resend Order Details'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">{t.exportCSV || 'Export CSV'}</span>
          </button>
          <button
            onClick={handleExportXLS}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">{t.exportXLS || 'Export XLS'}</span>
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className={`${theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'
        } border rounded-lg overflow-hidden`}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className={`w-12 h-12 ${textTertiary} mb-4`} />
            <p className={`${textSecondary}`}>{t.noOrdersFound || 'No orders found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <tr>
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOrders.size === filteredOrders.length}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  {columnVisibility.orderId && <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'} text-sm ${textSecondary}`}>{t.orderId || 'Order ID'}</th>}
                  {columnVisibility.purchaserName && <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'} text-sm ${textSecondary}`}>{t.purchaserName || 'Purchaser'}</th>}
                  {columnVisibility.email && <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'} text-sm ${textSecondary}`}>{t.email || 'Email'}</th>}
                  {columnVisibility.phone && <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'} text-sm ${textSecondary}`}>{t.phone || 'Phone'}</th>}
                  {columnVisibility.orderStatus && <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'} text-sm ${textSecondary}`}>{t.orderStatus || 'Status'}</th>}
                  {columnVisibility.totalAmount && <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'} text-sm ${textSecondary}`}>{t.totalAmount || 'Total'}</th>}
                  {columnVisibility.paymentStatus && <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'} text-sm ${textSecondary}`}>{t.paymentStatus || 'Payment'}</th>}
                  {columnVisibility.voucherAmount && <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'} text-sm ${textSecondary}`}>{t.voucherAmount || 'Voucher'}</th>}
                  {columnVisibility.creditCardAmount && <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'} text-sm ${textSecondary}`}>{t.creditCardAmount || 'Card'}</th>}
                  {columnVisibility.vendors && <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'} text-sm ${textSecondary}`}>{t.vendors || 'Vendors'}</th>}
                  {columnVisibility.campaign && <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'} text-sm ${textSecondary}`}>{t.campaign || 'Campaign'}</th>}
                  {columnVisibility.createdDate && <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'} text-sm ${textSecondary}`}>{t.createdDate || 'Created'}</th>}
                  {columnVisibility.paymentDate && <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'} text-sm ${textSecondary}`}>{t.paymentDate || 'Paid'}</th>}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => handleRowClick(order)}
                    className={`border-t cursor-pointer transition-colors ${theme === 'dark'
                        ? 'border-gray-800 hover:bg-gray-800/50'
                        : 'border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedOrders.has(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="rounded"
                      />
                    </td>
                    {columnVisibility.orderId && <td className={`p-3 text-sm ${textPrimary}`}>{order.id}</td>}
                    {columnVisibility.purchaserName && <td className={`p-3 text-sm ${textPrimary}`}>{order.purchaserName}</td>}
                    {columnVisibility.email && (
                      <td className="p-3">
                        <a
                          href={`mailto:${order.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`flex items-center gap-1 text-sm text-teal-500 hover:text-teal-600`}
                        >
                          <Mail className="w-3 h-3" />
                          {order.email}
                        </a>
                      </td>
                    )}
                    {columnVisibility.phone && (
                      <td className="p-3">
                        <a
                          href={`tel:${order.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`flex items-center gap-1 text-sm text-teal-500 hover:text-teal-600`}
                        >
                          <Phone className="w-3 h-3" />
                          {order.phone}
                        </a>
                      </td>
                    )}
                    {columnVisibility.orderStatus && <td className="p-3">{getOrderStatusBadge(order.orderStatus)}</td>}
                    {columnVisibility.totalAmount && <td className={`p-3 text-sm ${textPrimary}`}>₪{order.totalAmount.toLocaleString()}</td>}
                    {columnVisibility.paymentStatus && <td className="p-3">{getPaymentStatusBadge(order.paymentStatus)}</td>}
                    {columnVisibility.voucherAmount && <td className={`p-3 text-sm ${textTertiary}`}>₪{order.voucherAmount.toLocaleString()}</td>}
                    {columnVisibility.creditCardAmount && <td className={`p-3 text-sm ${textTertiary}`}>₪{order.creditCardAmount.toLocaleString()}</td>}
                    {columnVisibility.vendors && <td className={`p-3 text-sm ${textTertiary}`}>{order.vendors.join(', ')}</td>}
                    {columnVisibility.campaign && <td className={`p-3 text-sm ${textTertiary}`}>{order.campaign}</td>}
                    {columnVisibility.createdDate && <td className={`p-3 text-sm ${textTertiary}`}>{new Date(order.createdDate).toLocaleDateString()}</td>}
                    {columnVisibility.paymentDate && <td className={`p-3 text-sm ${textTertiary}`}>{new Date(order.paymentDate).toLocaleDateString()}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          theme={theme}
          onClose={() => setShowOrderDetails(false)}
        />
      )}

      {/* Add Order Wizard Modal */}
      {showAddOrderWizard && (
        <AddOrderWizard
          theme={theme}
          onClose={() => setShowAddOrderWizard(false)}
          onAddOrder={(newOrder) => {
            setOrders(prev => [newOrder as Order, ...prev]);
          }}
        />
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScannerModal
          theme={theme}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
}

// Helper Components
function StatCard({ label, value, theme, onClick }: { label: string; value: string; theme: Theme; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${theme === 'dark'
          ? 'bg-gray-900/50 border-gray-800 hover:border-teal-500'
          : 'bg-white border-gray-200 hover:border-teal-500'
        }`}
    >
      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{label}</p>
      <p className={`text-xl ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

// Helper function to generate last N months in MM-YYYY format
function getLastNMonths(n: number): { value: string; label: string }[] {
  const months = [];
  const now = new Date();

  for (let i = 0; i < n; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const value = `${month}-${year}`;
    const label = `${month}/${year}`;
    months.push({ value, label });
  }

  return months;
}

// Month Filter Component with custom date range
function MonthFilter({
  label,
  value,
  onChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  theme,
  isRTL,
  t
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  theme: Theme;
  isRTL: boolean;
  t: any;
}) {
  const [showAllMonths, setShowAllMonths] = useState(false);
  const last5Months = getLastNMonths(5);
  const last12Months = getLastNMonths(12);

  return (
    <div>
      <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} ${isRTL ? 'text-right' : ''}`}>
        {label}
      </label>

      {/* Main dropdown */}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (e.target.value !== 'custom') {
              onDateFromChange('');
              onDateToChange('');
            }
          }}
          className={`w-full px-3 py-2 rounded-lg border transition-colors ${isRTL ? 'text-right' : ''} ${theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-gray-100'
              : 'bg-white border-gray-300 text-gray-900'
            }`}
        >
          <option value="all">{t.all || 'All'}</option>
          {(showAllMonths ? last12Months : last5Months).map(month => (
            <option key={month.value} value={month.value}>{month.label}</option>
          ))}
          <option value="custom">{t.customRange || 'Custom Range'}</option>
        </select>

        {/* Show more/less button */}
        {!showAllMonths && (
          <button
            type="button"
            onClick={() => setShowAllMonths(true)}
            className={`text-xs mt-1 ${theme === 'dark' ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700'} ${isRTL ? 'text-right w-full' : 'text-left'}`}
          >
            {t.showMore || 'Show more months...'}
          </button>
        )}
      </div>

      {/* Custom date range inputs */}
      {value === 'custom' && (
        <div className="mt-2 space-y-2">
          <div>
            <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} ${isRTL ? 'text-right' : ''}`}>
              {t.from || 'From'}
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className={`w-full px-3 py-1.5 text-sm rounded-lg border transition-colors ${isRTL ? 'text-right' : ''} ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
            />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} ${isRTL ? 'text-right' : ''}`}>
              {t.to || 'To'}
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className={`w-full px-3 py-1.5 text-sm rounded-lg border transition-colors ${isRTL ? 'text-right' : ''} ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Cancellation Dialog Component
function CancellationDialog({
  type,
  itemName,
  theme,
  onCancel,
  onConfirm
}: {
  type: 'order' | 'item';
  itemName?: string;
  theme: Theme;
  onCancel: () => void;
  onConfirm: (reason: string, notes: string) => void;
}) {
  const { t, isRTL } = useLanguage();
  const [selectedReason, setSelectedReason] = useState('');
  const [notes, setNotes] = useState('');

  const cancellationReasons = [
    { value: '', label: t.selectReason || 'Select a reason...' },
    { value: 'customer_request', label: t.customerRequest || 'Customer Request' },
    { value: 'out_of_stock', label: t.outOfStock || 'Out of Stock' },
    { value: 'pricing_error', label: t.pricingError || 'Pricing Error' },
    { value: 'duplicate_order', label: t.duplicateOrder || 'Duplicate Order' },
    { value: 'payment_issue', label: t.paymentIssue || 'Payment Issue' },
    { value: 'other', label: t.other || 'Other' },
  ];

  const handleSubmit = () => {
    if (selectedReason && notes.trim()) {
      onConfirm(selectedReason, notes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
          }`}
      >
        <h3 className={`text-xl mb-4 ${isRTL ? 'text-right' : ''}`}>
          {type === 'order'
            ? (t.cancelOrder || 'Cancel Order')
            : (t.cancelItem || 'Cancel Item')}
        </h3>

        {itemName && (
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} ${isRTL ? 'text-right' : ''}`}>
            {t.cancelling || 'Cancelling'}: <span className="font-medium">{itemName}</span>
          </p>
        )}

        {/* Reason Dropdown */}
        <div className="mb-4">
          <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} ${isRTL ? 'text-right' : ''}`}>
            {t.cancellationReason || 'Cancellation Reason'} <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border transition-colors ${isRTL ? 'text-right' : ''} ${theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-100'
                : 'bg-white border-gray-300 text-gray-900'
              }`}
          >
            {cancellationReasons.map(reason => (
              <option key={reason.value} value={reason.value}>{reason.label}</option>
            ))}
          </select>
        </div>

        {/* Additional Notes */}
        <div className="mb-6">
          <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} ${isRTL ? 'text-right' : ''}`}>
            {t.additionalNotes || 'Additional Notes'} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder={t.enterDetails || 'Enter details...'}
            className={`w-full px-3 py-2 rounded-lg border transition-colors resize-none ${isRTL ? 'text-right' : ''} ${theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
          />
        </div>

        {/* Action Buttons */}
        <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || !notes.trim()}
            className={`flex-1 px-4 py-2 bg-red-500 text-white rounded-lg transition-colors ${!selectedReason || !notes.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-red-600'
              }`}
          >
            {t.submit || 'Submit'}
          </button>
          <button
            onClick={onCancel}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
          >
            {t.cancel || 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  theme,
  isRTL
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  theme: Theme;
  isRTL: boolean;
}) {
  return (
    <div>
      <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} ${isRTL ? 'text-right' : ''}`}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 rounded-lg border transition-colors ${isRTL ? 'text-right' : ''} ${theme === 'dark'
            ? 'bg-gray-800 border-gray-700 text-gray-100'
            : 'bg-white border-gray-300 text-gray-900'
          }`}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// Order Details Modal Component


function InfoRow({ label, value, theme }: { label: string; value: string; theme: Theme }) {
  const textTertiary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';

  return (
    <div>
      <p className={`text-xs ${textTertiary} mb-1`}>{label}</p>
      <p className={`text-sm ${textPrimary}`}>{value}</p>
    </div>
  );
}





