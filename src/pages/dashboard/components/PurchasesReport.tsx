import { useTranslation } from 'react-i18next';
import {  TrendingUp, Receipt } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

import { InfoTooltip } from '@/components/shared';

interface PurchaseMetricProps {
  label: string;
  value: string;
  change?: number;
  description?: string;
}

function PurchaseMetric({ label, value, change, description }: PurchaseMetricProps) {
  const hasChange = change !== undefined;
  const isPositive = change && change >= 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{label}</p>
      <div className="flex items-baseline gap-3">
        <p className="text-2xl text-gray-900 dark:text-white">{value}</p>
        {hasChange && (
          <span className={`text-sm flex items-center gap-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            <TrendingUp className={`w-3 h-3 ${!isPositive && 'rotate-180'}`} />
            {Math.abs(change!)}%
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
}

export default function PurchasesReport() {
  const { t } = useTranslation('dashboard');

  // Stacked bar chart data: vouchers + creditCards = orders
  const chartData = [
    { month: t('jul'), creditCards: 156, vouchers: 89, total: 245 },
    { month: t('aug'), creditCards: 195, vouchers: 117, total: 312 },
    { month: t('sep'), creditCards: 178, vouchers: 111, total: 289 },
    { month: t('oct'), creditCards: 245, vouchers: 133, total: 378 },
    { month: t('nov'), creditCards: 276, vouchers: 147, total: 423 },
    { month: t('dec'), creditCards: 298, vouchers: 158, total: 456 },
  ];

  return (
    <section>
      <div className="flex items-start gap-2 mb-6">
        <h2 className="text-gray-900 dark:text-white flex-1">{t('purchases_report')}</h2>
        <InfoTooltip 
          content={t('purchases_report_desc')}
          title={t('purchases_report')}
        />
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-linear-to-br from-green-500 to-emerald-600 rounded-lg">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white">{t('purchases_report')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive revenue and voucher metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <PurchaseMetric
            label={t('avg_order')}
            value="₪1,247"
            change={14.3}
            description="Per transaction"
          />
          <PurchaseMetric
            label={t('avg_voucher')}
            value="₪892"
            change={8.7}
            description="Per redemption"
          />
          <PurchaseMetric
            label={t('voucher_sold')}
            value="₪1,124"
            change={11.2}
            description="Per sale"
          />
          <PurchaseMetric
            label={t('total_orders')}
            value="₪12.4M"
            change={18.9}
            description="Last 30 days"
          />
          <PurchaseMetric
            label={t('total_vouchers')}
            value="₪4.89M"
            change={15.7}
            description="Last 30 days"
          />
        </div>

        <div className="h-64 min-h-[256px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={chartData}>
              <defs>
                <linearGradient id="creditCardGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={1} />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity={1} />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="voucherGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fde047" stopOpacity={1} />
                  <stop offset="50%" stopColor="#fbbf24" stopOpacity={1} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={1} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: number | undefined, name: string | undefined) => {
                  const safeValue = value ?? 0;
                  const label = name === 'creditCards' ? t('credit_card') : t('vouchers');
                  return [`${safeValue}K ₪`, label];
                }}
              />
              <Bar dataKey="creditCards" stackId="orders" fill="url(#creditCardGradient)" radius={[0, 0, 0, 0]} name={t('credit_card')} />
              <Bar dataKey="vouchers" stackId="orders" fill="url(#voucherGradient)" radius={[8, 8, 0, 0]} name={t('vouchers')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('credit_card')} (thousands ₪)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('vouchers')} (thousands ₪)</span>
          </div>
          <div className="flex items-center gap-2">
            <Receipt className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Total = {t('orders')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}