import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo, useRef, Activity } from 'react';
import {
  Search, Filter, Download, Plus, ChevronDown, ChevronUp,
  XCircle, Loader, AlertCircle, Columns, Mail, Phone,
  Truck, ShoppingBag,
  DollarSign, TrendingUp, Camera, ShoppingCart
} from 'lucide-react';

import { useAppSelector } from '@/hooks/hooks';
import { generateMockOrders } from '@/constants/data';
import { useThemeClasses } from '@/hooks/useThemeClasses';
import { PageStats, ReordableDataTable } from '@/components/shared';
import { CreateOrderWizard, FilterSelect, MonthFilter, OrderDetailsModal, QRScannerModal } from './components';


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

export default function OrdersMgmtPage() {
  const { t, i18n } = useTranslation('orders');
  const { isRTL, theme } = useAppSelector((state) => state.settings);
  const language = i18n.language;

  const { textPrimary, textSecondary, textTertiary } = useThemeClasses()

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [showAddOrderWizard, setShowAddOrderWizard] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const columnSettingsRef = useRef<HTMLDivElement>(null);


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

  const handleRowClick = (order: IOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleExportCSV = () => {
    const ordersToExport = selectedOrders.size > 0
      ? filteredOrders.filter(order => selectedOrders.has(order.id))
      : filteredOrders;

    if (ordersToExport?.length === 0) {
      alert(t('noOrdersToExport') || 'No orders to export');
      return;
    }

    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const headers: string[] = [];
    const columnKeys: string[] = [];

    if (columnVisibility.orderId) { headers.push(t('orderId')); columnKeys.push('orderId'); }
    if (columnVisibility.purchaserName) { headers.push(t('purchaserName')); columnKeys.push('purchaserName'); }
    if (columnVisibility.email) { headers.push(t('email')); columnKeys.push('email'); }
    if (columnVisibility.phone) { headers.push(t('phone')); columnKeys.push('phone'); }
    if (columnVisibility.orderStatus) { headers.push(t('orderStatus')); columnKeys.push('orderStatus'); }
    if (columnVisibility.totalAmount) { headers.push(t('totalAmount')); columnKeys.push('totalAmount'); }
    if (columnVisibility.paymentStatus) { headers.push(t('paymentStatus')); columnKeys.push('paymentStatus'); }
    if (columnVisibility.voucherAmount) { headers.push(t('voucherAmount')); columnKeys.push('voucherAmount'); }
    if (columnVisibility.creditCardAmount) { headers.push(t('creditCardAmount')); columnKeys.push('creditCardAmount'); }
    if (columnVisibility.vendors) { headers.push(t('vendors')); columnKeys.push('vendors'); }
    if (columnVisibility.campaign) { headers.push(t('campaign')); columnKeys.push('campaign'); }
    if (columnVisibility.createdDate) { headers.push(t('createdDate')); columnKeys.push('createdDate'); }
    if (columnVisibility.paymentDate) { headers.push(t('paymentDate')); columnKeys.push('paymentDate'); }

    let csvContent = headers.map(escapeCSV).join(',') + '\n';

    ordersToExport.forEach(order => {
      const row: string[] = [];

      columnKeys.forEach(key => {
        if (key === 'orderId') row.push(escapeCSV(order.id));
        else if (key === 'purchaserName') row.push(escapeCSV(order.purchaserName));
        else if (key === 'email') row.push(escapeCSV(order.email));
        else if (key === 'phone') row.push(escapeCSV(order.phone));
        else if (key === 'orderStatus') row.push(escapeCSV(order.orderStatus));
        else if (key === 'totalAmount') row.push(escapeCSV(`₪${order.totalAmount}`));
        else if (key === 'paymentStatus') row.push(escapeCSV(order.paymentStatus));
        else if (key === 'voucherAmount') row.push(escapeCSV(`₪${order.voucherAmount}`));
        else if (key === 'creditCardAmount') row.push(escapeCSV(`₪${order.creditCardAmount}`));
        else if (key === 'vendors') row.push(escapeCSV(order.vendors.join(', ')));
        else if (key === 'campaign') row.push(escapeCSV(order.campaign));
        else if (key === 'createdDate') row.push(escapeCSV(new Date(order.createdDate).toLocaleDateString()));
        else if (key === 'paymentDate') row.push(escapeCSV(new Date(order.paymentDate).toLocaleDateString()));
      });

      csvContent += row.join(',') + '\n';
    });

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
      alert(t('noOrdersSelected') || 'No orders selected');
      return;
    }

    console.log('Resending order details for:', ordersToResend.map(o => o.id));

    ordersToResend.forEach(order => {
      console.log(`Sending order details to ${order.email} for order ${order.id}`);
    });

    const message = ordersToResend.length === 1
      ? `${t('orderDetailsSent')} ${ordersToResend[0].email}`
      : `${t('orderDetailsSent')} ${ordersToResend.length} ${t('customers')}`;

    alert(message);

    setSelectedOrders(new Set());
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnSettingsRef.current && !columnSettingsRef.current.contains(event.target as Node)) {
        setShowColumnSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const orderStats = [
    {
      id: 1,
      title: t('totalOrders'),
      value: statistics.totalOrders.toLocaleString(),
      label: t('all'),
      icon: <ShoppingCart className="w-5 h-5 text-purple-500" />,
    },
    {
      id: 2,
      title: t('revenue'),
      value: `₪${statistics.totalRevenue.toLocaleString()}`,
      label: t('gross'),
      icon: <DollarSign className="w-5 h-5 text-green-500" />,
    },
    {
      id: 3,
      title: t('avgOrderValue'),
      value: `₪${Math.round(statistics.avgOrderValue).toLocaleString()}`,
      label: t('perOrder'),
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
    },
    {
      id: 4,
      title: t('pickups'),
      value: statistics.pickups.toLocaleString(),
      label: t('orders'),
      icon: <ShoppingBag className="w-5 h-5 text-orange-500" />,
    },
    {
      id: 5,
      title: t('deliveries'),
      value: statistics.deliveries.toLocaleString(),
      label: t('orders'),
      icon: <Truck className="w-5 h-5 text-teal-500" />,
    },
    {
      id: 6,
      title: t('cancelledOrders'),
      value: statistics.cancelledOrders.toLocaleString(),
      label: t('cancelled'),
      icon: <XCircle className="w-5 h-5 text-red-500" />,
    },
  ];


  const getOrderStatusBadge = (status: IOrder['orderStatus']) => {
    const badges = {
      draft: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300', label: t('draft') },
      processing: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-400', label: t('processing') },
      paid: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', label: t('paid') },
      confirmed: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-800 dark:text-teal-400', label: t('confirmed') },
      delivered: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-400', label: t('delivered') },
      completed: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-800 dark:text-emerald-400', label: t('completed') },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', label: t('cancelled') },
      partially_cancelled: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-400', label: t('partiallyCancelled') },
      failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', label: t('failed') },
    };
    const badge = badges[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badge?.bg} ${badge?.text}`}>
        {badge?.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: IOrder['paymentStatus']) => {
    const badges = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400', label: t('pending') },
      success: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', label: t('success') },
      failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', label: t('failed') },
      refunded: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-400', label: t('refunded') },
      partially_refunded: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-400', label: t('partiallyRefunded') },
    };
    const badge = badges[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badge?.bg} ${badge?.text}`}>
        {badge?.label}
      </span>
    );
  };

  return (
    <div className={`h-[calc(108vh-210px)] flex flex-col ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>

      {/* Page Header */}
      <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div>
          <h1 className={`text-2xl ${textPrimary}`}>{t('online_orders_management')}</h1>
          <p className={`text-sm ${textTertiary} mt-1`}>{t('online_orders_subtitle')}</p>
        </div>
        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={() => setShowQRScanner(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${theme === 'dark'
              ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300'
              : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
              }`}
            title={t('scanQRCode')}
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddOrderWizard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addOrder')}</span>
          </button>
        </div>
      </div>

      <PageStats
        stats={orderStats}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6"
      />

      {/* Search and Filters */}
      <div className={` border rounded-lg p-4 mb-6`}>
        <div className={`flex flex-col md:flex-row gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 ${textTertiary}`} />
            <input
              type="text"
              placeholder={t('searchOrders')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 text-right' : 'pl-10'} py-2 rounded-lg border transition-colors ${theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
            />
          </div>

          <button
            onClick={handleExportCSV}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${theme === 'dark'
              ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300'
              : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
              }`}
            title={t('downloadCSV')}
          >
            <Download className="w-4 h-4" />
            <span>{t('downloadCSV')}</span>
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${theme === 'dark'
              ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300'
              : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
              }`}
          >
            <Filter className="w-4 h-4" />
            <span>{t('filters')}</span>
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className="relative" ref={columnSettingsRef}>
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${theme === 'dark'
                ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                }`}
            >
              <Columns className="w-4 h-4" />
              <span>{t('columns')}</span>
            </button>

            {showColumnSettings && (
              <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-64 rounded-lg shadow-lg border z-10 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="p-3 max-h-96 overflow-y-auto">
                  {Object.entries(columnVisibility).map(([key, visible]) => (
                    <label key={key} className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={(e) => setColumnVisibility(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="rounded"
                      />
                      <span className={`text-sm ${textSecondary}`}>{t(key as keyof typeof t)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <FilterSelect
              label={t('orderType')}
              value={filters.orderType}
              onChange={(value) => setFilters(prev => ({ ...prev, orderType: value }))}
              options={[
                { value: 'all', label: t('all') },
                { value: 'online', label: t('online') },
                { value: 'offline', label: t('offline') },
              ]}
            />
            <FilterSelect
              label={t('deliveryType')}
              value={filters.deliveryType}
              onChange={(value) => setFilters(prev => ({ ...prev, deliveryType: value }))}
              options={[
                { value: 'all', label: t('all') },
                { value: 'pickup', label: t('pickup') },
                { value: 'delivery', label: t('delivery') },
                { value: 'digital', label: t('digital') },
              ]}
            />
            <FilterSelect
              label={t('paymentMethod')}
              value={filters.paymentMethod}
              onChange={(value) => setFilters(prev => ({ ...prev, paymentMethod: value }))}
              options={[
                { value: 'all', label: t('all') },
                { value: 'voucher', label: t('voucher') },
                { value: 'credit_card', label: t('creditCard') },
              ]}
            />
            <MonthFilter
              label={t('month')}
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
        <div className={`${theme === 'dark' ? 'bg-teal-900/30 border-teal-800' : 'bg-teal-50 border-teal-200'} border rounded-lg p-4 mb-4 flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className={`${textPrimary}`}>
            {selectedOrders.size} {t('selected')}
          </span>
          <button
            onClick={handleResendOrderDetails}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${theme === 'dark'
              ? 'bg-blue-800 hover:bg-blue-700 text-blue-100'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
          >
            <Mail className="w-4 h-4" />
            <span className="text-sm">{t('resendOrderDetails')}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${theme === 'dark'
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">{t('exportCSV')}</span>
          </button>
          <button
            onClick={handleExportXLS}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${theme === 'dark'
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">{t('exportXLS')}</span>
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className={`${theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden`}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className={`w-12 h-12 ${textTertiary} mb-4`} />
            <p className={`${textSecondary}`}>{t('noOrdersFound')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-hidden max-h-[calc(100vh-400px)]">
            <ReordableDataTable
              rowKey="id"
              data={filteredOrders}
              selectedItems={selectedOrders}
              onSelectionChange={() => setSelectedOrders}
              onRowClick={handleRowClick}
              storageKey="ordersTableColumnOrder"
              columns={[
                { key: 'checkbox', label: '', width: '50px' },
                columnVisibility.orderId && {
                  key: 'orderId',
                  label: t('order_id'),
                  sortable: true,
                  render: (order: any) => (
                    <div className="text-sm">{order.id}</div>
                  ),
                },

                columnVisibility.purchaserName && {
                  key: 'purchaserName',
                  label: t('purchaser_name'),
                  sortable: true,
                  render: (order: any) => (
                    <div className="text-sm">{order.purchaserName}</div>
                  ),
                },

                columnVisibility.email && {
                  key: 'email',
                  label: t('email'),
                  render: (order: any) => (
                    <a
                      href={`mailto:${order.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-sm text-teal-500 hover:text-teal-600"
                    >
                      <Mail className="w-3 h-3" />
                      {order.email}
                    </a>
                  ),
                },

                columnVisibility.phone && {
                  key: 'phone',
                  label: t('phone'),
                  render: (order: any) => (
                    <a
                      href={`tel:${order.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-sm text-teal-500 hover:text-teal-600"
                    >
                      <Phone className="w-3 h-3" />
                      {order.phone}
                    </a>
                  ),
                },

                columnVisibility.orderStatus && {
                  key: 'orderStatus',
                  label: t('order_status'),
                  render: (order: any) => getOrderStatusBadge(order.orderStatus),
                },

                columnVisibility.totalAmount && {
                  key: 'totalAmount',
                  label: t('total_amount'),
                  sortable: true,
                  render: (order: any) => (
                    <div className="text-sm font-medium">
                      ₪{order.totalAmount.toLocaleString()}
                    </div>
                  ),
                },

                columnVisibility.paymentStatus && {
                  key: 'paymentStatus',
                  label: t('payment_status'),
                  render: (order: any) => getPaymentStatusBadge(order.paymentStatus),
                },

                columnVisibility.voucherAmount && {
                  key: 'voucherAmount',
                  label: t('voucher_amount'),
                  sortable: true,
                  render: (order: any) => (
                    <div className="text-sm text-gray-500">
                      ₪{order.voucherAmount.toLocaleString()}
                    </div>
                  ),
                },

                columnVisibility.creditCardAmount && {
                  key: 'creditCardAmount',
                  label: t('credit_card_amount'),
                  sortable: true,
                  render: (order: any) => (
                    <div className="text-sm text-gray-500">
                      ₪{order.creditCardAmount.toLocaleString()}
                    </div>
                  ),
                },

                columnVisibility.vendors && {
                  key: 'vendors',
                  label: t('vendors'),
                  render: (order: any) => (
                    <div className="text-sm text-gray-500">
                      {order.vendors.join(', ')}
                    </div>
                  ),
                },

                columnVisibility.campaign && {
                  key: 'campaign',
                  label: t('campaign'),
                  render: (order: any) => (
                    <div className="text-sm text-gray-500">
                      {order.campaign}
                    </div>
                  ),
                },

                columnVisibility.createdDate && {
                  key: 'createdDate',
                  label: t('created_date'),
                  sortable: true,
                  render: (order: any) => (
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdDate).toLocaleDateString(language)}
                    </div>
                  ),
                },

                columnVisibility.paymentDate && {
                  key: 'paymentDate',
                  label: t('payment_date'),
                  sortable: true,
                  render: (order: any) => (
                    <div className="text-sm text-gray-500">
                      {new Date(order.paymentDate).toLocaleDateString(language)}
                    </div>
                  ),
                },
              ].filter(Boolean)}
            />
          </div>
        )}
      </div>

      <Activity mode={(selectedOrder && showOrderDetails) ? "visible" : "hidden"}>
        <OrderDetailsModal
          t={t}
          isRTL={isRTL}
          theme={theme}
          order={selectedOrder!}
          onClose={() => setShowOrderDetails(false)}
          getOrderStatusBadge={getOrderStatusBadge}
          getPaymentStatusBadge={getPaymentStatusBadge}
        />
      </Activity>

      <Activity mode={showAddOrderWizard ? "visible" : "hidden"}>
        <CreateOrderWizard
          onClose={() => setShowAddOrderWizard(false)}
          onAddOrder={(newOrder) => {
            setOrders(prev => [newOrder as IOrder, ...prev]);
          }}
        />
      </Activity>

      <Activity mode={showQRScanner ? "visible" : "hidden"}>
        <QRScannerModal onClose={() => setShowQRScanner(false)} />
      </Activity>
    </div>
  );
}
