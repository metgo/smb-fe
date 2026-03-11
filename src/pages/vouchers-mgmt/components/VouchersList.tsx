import React, { useState, useMemo } from 'react';
import { Plus, Download, Filter, X, ChevronDown, ChevronUp, Mail, Phone, MoreVertical, Clock, Send, XCircle, Calendar, RefreshCw, Search, MessageSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Theme, Language } from '../App';
import { MessageComposerModal, MessageData } from './MessageComposerModal';
import { SendResultsModal, SendResult } from './SendResultsModal';
import { toast } from 'sonner@2.0.3';

interface Voucher {
  id: string;
  code: string;
  assigneeName: string;
  email: string;
  phone: string;
  status: 'active' | 'assigned' | 'redeemed' | 'expired' | 'cancelled';
  amount: number;
  remainingAmount: number;
  expirationDate: string;
  campaign: string;
  website: string;
  createdAt: string;
  assignedAt?: string;
  creatorName: string;
  creatorEmail: string;
  creatorPhone: string;
}

interface VouchersListProps {
  language: Language;
  theme: Theme;
  isSidebarCollapsed: boolean;
  onVoucherClick: (voucherId: string) => void;
  onAddVoucher: () => void;
  refreshTrigger: number;
}

// Mock data generator
const generateMockVouchers = (): Voucher[] => {
  const statuses: Voucher['status'][] = ['active', 'assigned', 'redeemed', 'expired', 'cancelled'];
  const campaigns = ['Summer Sale 2024', 'New Year Promo', 'Spring Festival', 'Holiday Special', 'VIP Members', 'Welcome Bonus'];
  const websites = ['visitnegev.com', 'negevtourism.org', 'explorenegev.il', 'negev-adventures.com'];
  const firstNames = ['Yael', 'David', 'Sarah', 'Michael', 'Rachel', 'Daniel', 'Leah', 'Joshua', 'Miriam', 'Benjamin'];
  const lastNames = ['Cohen', 'Levi', 'Mizrahi', 'Peretz', 'Biton', 'Dahan', 'Avraham', 'Friedman', 'Katz', 'Ben-David'];

  return Array.from({ length: 150 }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const amount = [100, 200, 300, 500, 1000][Math.floor(Math.random() * 5)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const remainingAmount = status === 'redeemed' ? 0 : status === 'expired' || status === 'cancelled' ? amount : Math.floor(amount * Math.random());
    
    return {
      id: `voucher-${i + 1}`,
      code: `VCH-${String(i + 1).padStart(6, '0')}`,
      assigneeName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `+972-5${Math.floor(Math.random() * 9)}-${Math.floor(1000000 + Math.random() * 9000000)}`,
      status,
      amount,
      remainingAmount,
      expirationDate: new Date(Date.now() + (Math.random() * 365 - 180) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      campaign: campaigns[Math.floor(Math.random() * campaigns.length)],
      website: websites[Math.floor(Math.random() * websites.length)],
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedAt: status !== 'active' ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      creatorName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      creatorEmail: `${firstNames[Math.floor(Math.random() * firstNames.length)].toLowerCase()}.${lastNames[Math.floor(Math.random() * lastNames.length)].toLowerCase()}@example.com`,
      creatorPhone: `+972-5${Math.floor(Math.random() * 9)}-${Math.floor(1000000 + Math.random() * 9000000)}`
    };
  });
};

export function VouchersList({
  language,
  theme,
  isSidebarCollapsed,
  onVoucherClick,
  onAddVoucher,
  refreshTrigger
}: VouchersListProps) {
  const { t, isRTL } = useLanguage();
  const [vouchers] = useState<Voucher[]>(generateMockVouchers());
  const [selectedVouchers, setSelectedVouchers] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [websiteFilter, setWebsiteFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minAmount, setMinAmount] = useState<number>(0);
  const [maxAmount, setMaxAmount] = useState<number>(1000);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [creatorSearch, setCreatorSearch] = useState('');

  // Calculate min/max amounts from data
  const amountRange = useMemo(() => {
    const amounts = vouchers.map(v => v.amount);
    return {
      min: Math.min(...amounts),
      max: Math.max(...amounts)
    };
  }, [vouchers]);

  // Initialize slider values based on data
  const [isInitialized, setIsInitialized] = useState(false);
  if (!isInitialized && amountRange.min && amountRange.max) {
    setMinAmount(amountRange.min);
    setMaxAmount(amountRange.max);
    setIsInitialized(true);
  }

  // Get unique values for filters
  const campaigns = useMemo(() => {
    return Array.from(new Set(vouchers.map(v => v.campaign))).sort();
  }, [vouchers]);

  const websites = useMemo(() => {
    return Array.from(new Set(vouchers.map(v => v.website))).sort();
  }, [vouchers]);

  // Apply filters
  const filteredVouchers = useMemo(() => {
    return vouchers.filter(voucher => {
      if (statusFilter !== 'all' && voucher.status !== statusFilter) return false;
      if (campaignFilter !== 'all' && voucher.campaign !== campaignFilter) return false;
      if (websiteFilter !== 'all' && voucher.website !== websiteFilter) return false;
      if (searchQuery && !voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !voucher.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !voucher.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (minAmount && voucher.amount < minAmount) return false;
      if (maxAmount && voucher.amount > maxAmount) return false;
      if (dateFrom && new Date(voucher.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(voucher.createdAt) > new Date(dateTo)) return false;
      if (creatorSearch && !voucher.creatorName.toLowerCase().includes(creatorSearch.toLowerCase())) return false;
      return true;
    });
  }, [vouchers, statusFilter, campaignFilter, websiteFilter, searchQuery, minAmount, maxAmount, dateFrom, dateTo, creatorSearch]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredVouchers.length;
    const assigned = filteredVouchers.filter(v => v.status === 'assigned' || v.status === 'redeemed').length;
    const redeemed = filteredVouchers.filter(v => v.status === 'redeemed').length;
    const expired = filteredVouchers.filter(v => v.status === 'expired').length;
    const totalBalance = filteredVouchers.reduce((sum, v) => sum + v.remainingAmount, 0);
    const revenue = filteredVouchers.filter(v => v.status === 'redeemed').reduce((sum, v) => sum + v.amount, 0);

    return {
      total,
      assigned,
      redeemed,
      expired,
      totalBalance,
      revenue
    };
  }, [filteredVouchers]);

  const handleSelectAll = () => {
    if (selectedVouchers.size === filteredVouchers.length) {
      setSelectedVouchers(new Set());
    } else {
      setSelectedVouchers(new Set(filteredVouchers.map(v => v.id)));
    }
  };

  const handleSelectVoucher = (voucherId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedVouchers);
    if (newSelected.has(voucherId)) {
      newSelected.delete(voucherId);
    } else {
      newSelected.add(voucherId);
    }
    setSelectedVouchers(newSelected);
  };

  const getStatusColor = (status: Voucher['status']) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'assigned': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'redeemed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: Voucher['status']) => {
    const labels = {
      active: 'Active',
      assigned: 'Assigned',
      redeemed: 'Redeemed',
      expired: 'Expired',
      cancelled: 'Cancelled'
    };
    return labels[status];
  };

  const isExpiringSoon = (date: string) => {
    const daysUntilExpiry = Math.floor((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  const isExpired = (date: string) => {
    return new Date(date) < new Date();
  };

  const [messageComposerOpen, setMessageComposerOpen] = useState(false);
  const [sendResultsOpen, setSendResultsOpen] = useState(false);
  const [sendResults, setSendResults] = useState<SendResult[]>([]);

  const handleSendMessage = (data: MessageData) => {
    const selectedVoucherData = filteredVouchers.filter((v) =>
      selectedVouchers.has(v.id)
    );

    // Simulate sending messages
    const results: SendResult[] = selectedVoucherData.map((voucher) => {
      // Simulate success/failure
      const emailSuccess = Math.random() > 0.1; // 90% success rate
      const smsSuccess = Math.random() > 0.15; // 85% success rate

      return {
        customerId: voucher.id,
        customerName: voucher.assigneeName,
        email: voucher.email,
        phone: voucher.phone,
        emailStatus: emailSuccess ? 'success' : 'failed',
        smsStatus: smsSuccess ? 'success' : 'failed',
        errorMessage: !emailSuccess || !smsSuccess ? 'Network timeout' : undefined,
      };
    });

    // Log the message
    const messageLog = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipientCount: results.length,
      subject: data.subject,
      emailMessage: data.emailMessage,
      smsMessage: data.smsMessage,
      template: data.template,
      results,
    };

    // Save to localStorage
    const existingLogs = JSON.parse(localStorage.getItem('message-logs') || '[]');
    localStorage.setItem('message-logs', JSON.stringify([messageLog, ...existingLogs]));

    // Show results
    setSendResults(results);
    setMessageComposerOpen(false);
    setSendResultsOpen(true);

    // Clear selection
    setSelectedVouchers(new Set());

    toast.success(`Messages sent to ${results.length} customer${results.length !== 1 ? 's' : ''}`);
  };

  const handleSendVouchers = () => {
    const selectedVoucherData = filteredVouchers.filter((v) =>
      selectedVouchers.has(v.id)
    );

    // Simulate re-sending vouchers via email
    toast.success(`Re-sent ${selectedVoucherData.length} voucher${selectedVoucherData.length !== 1 ? 's' : ''} via email`);
    
    // Clear selection
    setSelectedVouchers(new Set());
  };

  return (
    <div className={`flex-1 flex flex-col transition-all duration-300 ${
      isRTL 
        ? (isSidebarCollapsed ? 'mr-16' : 'mr-64')
        : (isSidebarCollapsed ? 'ml-16' : 'ml-64')
    }`}>
      {/* Fixed Header Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        {/* Page Title and Actions */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2 bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Vouchers Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create, track, and manage vouchers across all tourism websites
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters
                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title="Toggle Filters"
              >
                <Filter className="w-5 h-5" />
              </button>
              <button
                className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Export Data"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={onAddVoucher}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Voucher</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="text-blue-600 dark:text-blue-400 text-sm mb-1">Total Vouchers</div>
              <div className="text-blue-900 dark:text-blue-100 text-2xl">{stats.total}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="text-purple-600 dark:text-purple-400 text-sm mb-1">Assigned</div>
              <div className="text-purple-900 dark:text-purple-100 text-2xl">{stats.assigned}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="text-green-600 dark:text-green-400 text-sm mb-1">Redeemed</div>
              <div className="text-green-900 dark:text-green-100 text-2xl">{stats.redeemed}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <div className="text-orange-600 dark:text-orange-400 text-sm mb-1">Remaining Balance</div>
              <div className="text-orange-900 dark:text-orange-100 text-2xl">₪{stats.totalBalance.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Expired</div>
              <div className="text-gray-900 dark:text-gray-100 text-2xl">{stats.expired}</div>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
              <div className="text-teal-600 dark:text-teal-400 text-sm mb-1">Revenue</div>
              <div className="text-teal-900 dark:text-teal-100 text-2xl">₪{stats.revenue.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Toolbar */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[200px] max-w-md">
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by code, assignee name, email..."
                  className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-teal-500 outline-none`}
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  showFilters
                    ? 'bg-teal-50 dark:bg-teal-950 border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>

              <button
                onClick={onAddVoucher}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Voucher</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="assigned">Assigned</option>
                  <option value="redeemed">Redeemed</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Campaign</label>
                <select
                  value={campaignFilter}
                  onChange={(e) => setCampaignFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="all">All Campaigns</option>
                  {campaigns.map(campaign => (
                    <option key={campaign} value={campaign}>{campaign}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Website</label>
                <select
                  value={websiteFilter}
                  onChange={(e) => setWebsiteFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="all">All Websites</option>
                  {websites.map(website => (
                    <option key={website} value={website}>{website}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Amount Range</label>
                <div className="space-y-2">
                  <div className="relative pt-1">
                    <input
                      type="range"
                      min={amountRange.min}
                      max={amountRange.max}
                      value={minAmount}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value <= maxAmount) {
                          setMinAmount(value);
                        }
                      }}
                      className="absolute w-full h-2 bg-transparent appearance-none z-20 cursor-pointer"
                      style={{
                        background: 'transparent'
                      }}
                    />
                    <input
                      type="range"
                      min={amountRange.min}
                      max={amountRange.max}
                      value={maxAmount}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= minAmount) {
                          setMaxAmount(value);
                        }
                      }}
                      className="absolute w-full h-2 bg-transparent appearance-none z-10 cursor-pointer"
                      style={{
                        background: 'transparent'
                      }}
                    />
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className="absolute h-2 bg-teal-500 rounded-full"
                        style={{
                          left: `${((minAmount - amountRange.min) / (amountRange.max - amountRange.min)) * 100}%`,
                          right: `${100 - ((maxAmount - amountRange.min) / (amountRange.max - amountRange.min)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span>₪{minAmount}</span>
                    <span>₪{maxAmount}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-1/2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-1/2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Creator Search</label>
                <input
                  type="text"
                  value={creatorSearch}
                  onChange={(e) => setCreatorSearch(e.target.value)}
                  placeholder="Name..."
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>
            {(statusFilter !== 'all' || campaignFilter !== 'all' || websiteFilter !== 'all' || searchQuery || minAmount !== amountRange.min || maxAmount !== amountRange.max || dateFrom || dateTo || creatorSearch) && (
              <div className="mt-3">
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setCampaignFilter('all');
                    setWebsiteFilter('all');
                    setSearchQuery('');
                    setMinAmount(amountRange.min);
                    setMaxAmount(amountRange.max);
                    setDateFrom('');
                    setDateTo('');
                    setCreatorSearch('');
                  }}
                  className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedVouchers.size > 0 && (
          <div className="px-6 py-3 bg-teal-50 dark:bg-teal-900/20 border-b border-teal-200 dark:border-teal-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-teal-900 dark:text-teal-100">
                {selectedVouchers.size} voucher{selectedVouchers.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <span>Actions</span>
                  {showBulkActions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setSelectedVouchers(new Set())}
                  className="p-1.5 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30 rounded transition-colors"
                  title="Clear selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {showBulkActions && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setMessageComposerOpen(true)}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm border border-gray-300 dark:border-gray-700"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </button>
                <button
                  onClick={handleSendVouchers}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm border border-gray-300 dark:border-gray-700"
                >
                  <Send className="w-4 h-4" />
                  Re-send Vouchers
                </button>
                <button className="px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm border border-gray-300 dark:border-gray-700">
                  <Calendar className="w-4 h-4" />
                  Extend Expiration
                </button>
                <button className="px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm border border-gray-300 dark:border-gray-700">
                  <RefreshCw className="w-4 h-4" />
                  Change Status
                </button>
                <button className="px-3 py-1.5 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 text-sm border border-red-300 dark:border-red-700">
                  <XCircle className="w-4 h-4" />
                  Cancel Vouchers
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scrollable Table Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedVouchers.size === filteredVouchers.length && filteredVouchers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">Voucher Code</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">Assignee</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">Contact</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">Amount</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">Remaining</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">Expiration</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">Campaign</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredVouchers.map((voucher) => (
                    <tr
                      key={voucher.id}
                      onClick={() => onVoucherClick(voucher.id)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedVouchers.has(voucher.id)}
                          onChange={(e) => handleSelectVoucher(voucher.id, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{voucher.code}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{voucher.assigneeName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${voucher.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                            title={voucher.email}
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                          <a
                            href={`tel:${voucher.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                            title={voucher.phone}
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(voucher.status)}`}>
                          {getStatusLabel(voucher.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 dark:text-gray-100">₪{voucher.amount}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 dark:text-gray-100">₪{voucher.remainingAmount}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${
                            isExpired(voucher.expirationDate)
                              ? 'text-red-600 dark:text-red-400'
                              : isExpiringSoon(voucher.expirationDate)
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {voucher.expirationDate}
                          </span>
                          {isExpiringSoon(voucher.expirationDate) && !isExpired(voucher.expirationDate) && (
                            <Clock className="w-4 h-4 text-orange-500" title="Expiring soon" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{voucher.campaign}</div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Show action menu
                          }}
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredVouchers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No vouchers found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Composer Modal */}
      <MessageComposerModal
        isOpen={messageComposerOpen}
        onClose={() => setMessageComposerOpen(false)}
        recipientCount={selectedVouchers.size}
        onSend={handleSendMessage}
        theme={theme}
      />

      {/* Send Results Modal */}
      <SendResultsModal
        isOpen={sendResultsOpen}
        onClose={() => setSendResultsOpen(false)}
        results={sendResults}
        theme={theme}
      />
    </div>
  );
}