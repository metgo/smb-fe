import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Search, DollarSign, Users, TrendingUp, Award, Target, Download, Copy, CheckSquare, Square } from 'lucide-react';

import { MiniCampaignWizard } from './components';
import { useThemeClasses } from '@/hooks/useThemeClasses';
import { useAppSelector } from '@/hooks/hooks';
import { AddButton } from '@/components/btns';
import { PageStats, ViewModeToggle } from '@/components/shared';

interface MiniCampaign {
  id: string;
  campaignCode: string;
  campaignName: string;
  companyName: string;
  website: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'draft' | 'completed' | 'paused';
  voucherAmount: number;
  totalVouchers: number;
  usedVouchers: number;
  revenue: number;
  conversionRate: number;
}

export default function MiniCampaignsMgmtPage() {
  const { t } = useTranslation('mini_campaign');
  const { theme } = useAppSelector((state) => state.settings)

  const themeColor = useThemeClasses()
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showWizard, setShowWizard] = useState(false);
  const [editingMiniCampaign, setEditingMiniCampaign] = useState<MiniCampaign | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>('');

  // Mock data
  const [miniCampaigns, setMiniCampaigns] = useState<MiniCampaign[]>(
    Array.from({ length: 25 }, (_, i) => ({
      id: `mc-${i + 1}`,
      campaignCode: `CAMP${String(i + 1).padStart(4, '0')}`,
      campaignName: `Campaign ${i + 1}`,
      companyName: `Company ${Math.floor(i / 5) + 1}`,
      website: `Website ${(i % 3) + 1}`,
      startDate: new Date(2024, i % 12, 1).toISOString().split('T')[0],
      endDate: new Date(2024, (i % 12) + 1, 0).toISOString().split('T')[0],
      status: ['active', 'draft', 'completed', 'paused'][i % 4] as any,
      voucherAmount: [50, 100, 150, 200][i % 4],
      totalVouchers: [100, 200, 300, 500][i % 4],
      usedVouchers: Math.floor(Math.random() * 100),
      revenue: Math.floor(Math.random() * 50000),
      conversionRate: Math.floor(Math.random() * 100)
    }))
  );



  const filteredMiniCampaigns = miniCampaigns.filter(campaign => {
    const matchesSearch = campaign.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.campaignCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate KPIs
  const totalCampaigns = miniCampaigns.length;
  const activeCampaigns = miniCampaigns.filter(c => c.status === 'active').length;
  const totalRevenue = miniCampaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalVouchers = miniCampaigns.reduce((sum, c) => sum + c.totalVouchers, 0);
  const usedVouchers = miniCampaigns.reduce((sum, c) => sum + c.usedVouchers, 0);
  const avgConversion = miniCampaigns.reduce((sum, c) => sum + c.conversionRate, 0) / miniCampaigns.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'draft': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      case 'completed': return 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'paused': return 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const handleCreateMiniCampaign = (data: any, status: 'draft' | 'active') => {
    if (editingMiniCampaign) {
      // Edit existing mini-campaign
      setMiniCampaigns(miniCampaigns.map(campaign =>
        campaign.id === editingMiniCampaign.id
          ? {
            ...campaign,
            campaignCode: data.campaignCode,
            campaignName: data.campaignName,
            companyName: data.companyName,
            website: data.selectedWebsite,
            startDate: data.startDate,
            endDate: data.endDate,
            status: status,
            voucherAmount: parseFloat(data.voucherAmount),
            totalVouchers: parseFloat(data.totalVouchers),
          }
          : campaign
      ));
    } else {
      // Create new mini-campaign
      const newMiniCampaign: MiniCampaign = {
        id: `mc-${miniCampaigns.length + 1}`,
        campaignCode: data.campaignCode,
        campaignName: data.campaignName,
        companyName: data.companyName,
        website: data.selectedWebsite,
        startDate: data.startDate,
        endDate: data.endDate,
        status: status,
        voucherAmount: parseFloat(data.voucherAmount),
        totalVouchers: parseFloat(data.totalVouchers),
        usedVouchers: 0,
        revenue: 0,
        conversionRate: 0
      };
      setMiniCampaigns([newMiniCampaign, ...miniCampaigns]);
    }
    setShowWizard(false);
    setEditingMiniCampaign(null);
  };

  const handleRowClick = (campaign: MiniCampaign) => {
    setEditingMiniCampaign(campaign);
    setShowWizard(true);
  };

  // Bulk actions handlers
  const toggleRowSelection = (id: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredMiniCampaigns.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredMiniCampaigns.map(campaign => campaign.id)));
    }
  };

  const handleBulkStatusChange = () => {
    if (!bulkStatus || selectedRows.size === 0) return;

    setMiniCampaigns(miniCampaigns.map(campaign =>
      selectedRows.has(campaign.id)
        ? { ...campaign, status: bulkStatus as any }
        : campaign
    ));
    setSelectedRows(new Set());
    setBulkStatus('');
  };

  const handleDuplicate = () => {
    if (selectedRows.size !== 1) return;

    const campaignId = Array.from(selectedRows)[0];
    const campaignToDuplicate = miniCampaigns.find(c => c.id === campaignId);
    if (!campaignToDuplicate) return;

    const duplicatedCampaign: MiniCampaign = {
      ...campaignToDuplicate,
      id: `mc-${miniCampaigns.length + 1}`,
      campaignCode: `${campaignToDuplicate.campaignCode}-COPY`,
      campaignName: `${campaignToDuplicate.campaignName} (Copy)`,
      status: 'draft',
      usedVouchers: 0,
      revenue: 0,
      conversionRate: 0
    };

    setMiniCampaigns([duplicatedCampaign, ...miniCampaigns]);
    setSelectedRows(new Set());
  };

  const exportToCSV = () => {
    if (selectedRows.size === 0) return;

    const selectedCampaigns = miniCampaigns.filter(campaign => selectedRows.has(campaign.id));
    const headers = ['Campaign Code', 'Campaign Name', 'Company Name', 'Website', 'Status', 'Voucher Amount', 'Total Vouchers', 'Used Vouchers', 'Revenue', 'Start Date', 'End Date'];
    const csvContent = [
      headers.join(','),
      ...selectedCampaigns.map(campaign => [
        campaign.campaignCode,
        `"${campaign.campaignName}"`,
        `"${campaign.companyName}"`,
        campaign.website,
        campaign.status,
        campaign.voucherAmount,
        campaign.totalVouchers,
        campaign.usedVouchers,
        campaign.revenue,
        campaign.startDate,
        campaign.endDate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mini-campaigns-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setSelectedRows(new Set());
  };

  const exportToXLS = () => {
    if (selectedRows.size === 0) return;

    const selectedCampaigns = miniCampaigns.filter(campaign => selectedRows.has(campaign.id));
    const headers = ['Campaign Code', 'Campaign Name', 'Company Name', 'Website', 'Status', 'Voucher Amount', 'Total Vouchers', 'Used Vouchers', 'Revenue', 'Start Date', 'End Date'];

    // Create HTML table for Excel
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="utf-8"></head>
        <body>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${selectedCampaigns.map(campaign => `
                <tr>
                  <td>${campaign.campaignCode}</td>
                  <td>${campaign.campaignName}</td>
                  <td>${campaign.companyName}</td>
                  <td>${campaign.website}</td>
                  <td>${campaign.status}</td>
                  <td>${campaign.voucherAmount}</td>
                  <td>${campaign.totalVouchers}</td>
                  <td>${campaign.usedVouchers}</td>
                  <td>${campaign.revenue}</td>
                  <td>${campaign.startDate}</td>
                  <td>${campaign.endDate}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mini-campaigns-export-${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    setSelectedRows(new Set());
  };


  const pageStats = [
    {
      id: 1,
      title: t('total_campaigns'),
      value: totalCampaigns,
      label: t('campaigns'),
      icon: <Target className="w-5 h-5 text-purple-600" />,
    },
    {
      id: 2,
      title: t('active_campaigns'),
      value: activeCampaigns,
      label: t('campaigns'),
      icon: <TrendingUp className="w-5 h-5 text-green-600" />,
    },
    {
      id: 3,
      title: t('total_revenue'),
      value: `₪${totalRevenue.toLocaleString()}`,
      label: t('total'),
      icon: <DollarSign className="w-5 h-5 text-blue-600" />,
    },
    {
      id: 4,
      title: t('total_vouchers'),
      value: totalVouchers,
      label: t('total'),
      icon: <Users className="w-5 h-5 text-orange-600" />,
    },
    {
      id: 5,
      title: t('used_vouchers'),
      value: usedVouchers,
      label: t('vouchers'),
      icon: <Award className="w-5 h-5 text-pink-600" />,
    },
    {
      id: 6,
      title: t('conversion_rate'),
      value: `${avgConversion.toFixed(1)}%`,
      label: t('rate'),
      icon: <TrendingUp className="w-5 h-5 text-teal-600" />,
    },
  ];


  return (
    <>
      <div className="">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-3xl mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent`}>
            {t('mini_campaigns_management')}
          </h1>
          <p className={themeColor.textSecondary}>{t('manage_all_mini_campaigns')}</p>
        </div>

        {/* KPI Cards */}
        <PageStats stats={pageStats} />

        {/* Toolbar */}
        <div className={`${themeColor.bgPrimary} rounded-xl p-4 border ${themeColor.borderColor} mb-6`}>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-1 items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:max-w-md">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${themeColor.textTertiary}`} />
                <input
                  type="text"
                  placeholder={t('search_campaigns')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${themeColor.borderColor} ${themeColor.bgSecondary} ${themeColor.textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${themeColor.borderColor} ${themeColor.bgSecondary} ${themeColor.textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="all">{t('all_statuses')}</option>
                <option value="active">{t('active')}</option>
                <option value="draft">{t('draft')}</option>
                <option value="completed">{t('completed')}</option>
                <option value="paused">{t('paused')}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <ViewModeToggle onChange={setViewMode} value={viewMode} />
              <AddButton label={t('create_mini_campaign')} handleClick={() => setShowWizard(true)} />
            </div>
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedRows.size > 0 && (
          <div className={`${themeColor.bgPrimary} rounded-xl p-4 border ${themeColor.borderColor} mb-6 shadow-lg`}>
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-purple-600" />
                <span className={themeColor.textPrimary}>
                  {selectedRows.size} {selectedRows.size === 1 ? t('item_selected') : t('items_selected')}
                </span>
                <button
                  onClick={() => setSelectedRows(new Set())}
                  className={`text-sm ${themeColor.textTertiary} hover:${themeColor.textSecondary} underline`}
                >
                  {t('clear_selection')}
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Status Change */}
                <div className="flex items-center gap-2">
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className={`px-3 py-2 rounded-lg border ${themeColor.borderColor} ${themeColor.bgSecondary} ${themeColor.textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
                  >
                    <option value="">{t('change_status')}</option>
                    <option value="active">{t('active')}</option>
                    <option value="draft">{t('draft')}</option>
                    <option value="completed">{t('completed')}</option>
                    <option value="paused">{t('paused')}</option>
                  </select>
                  <button
                    onClick={handleBulkStatusChange}
                    disabled={!bulkStatus}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${bulkStatus
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {t('apply')}
                  </button>
                </div>

                {/* Duplicate - only show when exactly 1 row selected */}
                {selectedRows.size === 1 && (
                  <button
                    onClick={handleDuplicate}
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-2 text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    {t('duplicate')}
                  </button>
                )}

                {/* Export Actions */}
                <button
                  onClick={exportToCSV}
                  className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
                <button
                  onClick={exportToXLS}
                  className="px-3 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-all flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  XLS
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {viewMode === 'list' ? (
          <div className={`${themeColor.bgPrimary} rounded-xl border ${themeColor.borderColor} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${themeColor.bgSecondary} border-b ${themeColor.borderColor}`}>
                  <tr>
                    <th className={`px-4 py-3 w-12`}>
                      <button
                        onClick={toggleSelectAll}
                        className="flex items-center justify-center"
                      >
                        {selectedRows.size === filteredMiniCampaigns.length && filteredMiniCampaigns.length > 0 ? (
                          <CheckSquare className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Square className={`w-5 h-5 ${themeColor.textTertiary}`} />
                        )}
                      </button>
                    </th>
                    <th className={`px-4 py-3 text-left text-sm ${themeColor.textSecondary}`}>{t('campaign_code')}</th>
                    <th className={`px-4 py-3 text-left text-sm ${themeColor.textSecondary}`}>{t('campaign_name')}</th>
                    <th className={`px-4 py-3 text-left text-sm ${themeColor.textSecondary}`}>{t('company_name')}</th>
                    <th className={`px-4 py-3 text-left text-sm ${themeColor.textSecondary}`}>{t('website')}</th>
                    <th className={`px-4 py-3 text-left text-sm ${themeColor.textSecondary}`}>{t('status')}</th>
                    <th className={`px-4 py-3 text-left text-sm ${themeColor.textSecondary}`}>{t('voucher_amount')}</th>
                    <th className={`px-4 py-3 text-left text-sm ${themeColor.textSecondary}`}>{t('total_vouchers')}</th>
                    <th className={`px-4 py-3 text-left text-sm ${themeColor.textSecondary}`}>{t('used_vouchers')}</th>
                    <th className={`px-4 py-3 text-left text-sm ${themeColor.textSecondary}`}>{t('revenue')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMiniCampaigns.map((campaign) => (
                    <tr key={campaign.id} className={`border-b ${themeColor.borderColor} hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer`} onClick={() => handleRowClick(campaign)}>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleRowSelection(campaign.id)}
                          className="flex items-center justify-center"
                        >
                          {selectedRows.has(campaign.id) ? (
                            <CheckSquare className="w-5 h-5 text-purple-600" />
                          ) : (
                            <Square className={`w-5 h-5 ${themeColor.textTertiary}`} />
                          )}
                        </button>
                      </td>
                      <td className={`px-4 py-3 ${themeColor.textPrimary} font-mono text-sm`}>{campaign.campaignCode}</td>
                      <td className={`px-4 py-3 ${themeColor.textPrimary}`}>{campaign.campaignName}</td>
                      <td className={`px-4 py-3 ${themeColor.textSecondary}`}>{campaign.companyName}</td>
                      <td className={`px-4 py-3 ${themeColor.textSecondary}`}>{campaign.website}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs border ${getStatusColor(campaign.status)}`}>
                          {t(campaign.status)}
                        </span>
                      </td>
                      <td className={`px-4 py-3 ${themeColor.textPrimary}`}>₪{campaign.voucherAmount}</td>
                      <td className={`px-4 py-3 ${themeColor.textPrimary}`}>{campaign.totalVouchers}</td>
                      <td className={`px-4 py-3 ${themeColor.textPrimary}`}>
                        {campaign.usedVouchers}
                        <span className={`ml-2 text-xs ${themeColor.textTertiary}`}>
                          ({((campaign.usedVouchers / campaign.totalVouchers) * 100).toFixed(0)}%)
                        </span>
                      </td>
                      <td className={`px-4 py-3 ${themeColor.textPrimary}`}>₪{campaign.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMiniCampaigns.map((campaign) => (
              <div key={campaign.id} className={`${themeColor.bgPrimary} rounded-xl p-5 border ${themeColor.borderColor} hover:shadow-lg transition-all relative cursor-pointer`} onClick={() => handleRowClick(campaign)}>
                {/* Checkbox for grid view */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRowSelection(campaign.id);
                  }}
                  className="absolute top-4 right-4 z-10"
                >
                  {selectedRows.has(campaign.id) ? (
                    <CheckSquare className="w-5 h-5 text-purple-600" />
                  ) : (
                    <Square className={`w-5 h-5 ${themeColor.textTertiary}`} />
                  )}
                </button>

                {/* Logo and Header */}
                <div className="flex items-start gap-4 mb-4 pr-8">
                  <div className={`w-16 h-16 rounded-lg ${themeColor.bgSecondary} flex items-center justify-center flex-shrink-0 border ${themeColor.borderColor}`}>
                    <Building2 className={`w-8 h-8 ${themeColor.textTertiary}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`${themeColor.textPrimary} mb-1 truncate`}>{campaign.campaignName}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs border ${getStatusColor(campaign.status)}`}>
                      {t(campaign.status)}
                    </span>
                  </div>
                </div>

                {/* Voucher Usage Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className={themeColor.textTertiary}>{t('vouchers')}:</span>
                    <span className={themeColor.textPrimary}>
                      {campaign.usedVouchers} / {campaign.totalVouchers}
                    </span>
                  </div>
                  <div className={`w-full h-2 ${themeColor.bgSecondary} rounded-full overflow-hidden`}>
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all"
                      style={{ width: `${(campaign.usedVouchers / campaign.totalVouchers) * 100}%` }}
                    />
                  </div>
                  <p className={`text-xs ${themeColor.textTertiary} mt-1 text-right`}>
                    {((campaign.usedVouchers / campaign.totalVouchers) * 100).toFixed(0)}% {t('used')}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className={`grid grid-cols-2 gap-3 pt-4 border-t ${themeColor.borderColor}`}>
                  <div>
                    <p className={`text-xs ${themeColor.textTertiary} mb-1`}>{t('voucher_amount')}</p>
                    <p className={`${themeColor.textPrimary}`}>₪{campaign.voucherAmount}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${themeColor.textTertiary} mb-1`}>{t('revenue')}</p>
                    <p className={`${themeColor.textPrimary}`}>₪{campaign.revenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Wizard Modal */}
      {showWizard && (
        <MiniCampaignWizard
          theme={theme}
          onClose={() => {
            setShowWizard(false);
            setEditingMiniCampaign(null);
          }}
          onSubmit={handleCreateMiniCampaign}
          editingMiniSite={editingMiniCampaign}
        />
      )
      }
    </>

  );
}