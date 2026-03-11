import { useState } from 'react';
import { GlobalHeader } from './components/GlobalHeader';
import { Sidebar } from './components/Sidebar';
import { VouchersList } from './components/VouchersList';
import { VoucherDetails } from './components/VoucherDetails';
import { AddVoucherWizard } from './components/AddVoucherWizard';
import type { Language, Theme } from './App';

interface VouchersManagementProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onNavigate: (item: string) => void;
}

export default function VouchersManagement({
  language,
  setLanguage,
  theme,
  setTheme,
  onNavigate
}: VouchersManagementProps) {
  const [selectedAuthority, setSelectedAuthority] = useState('all');
  const [selectedWebsite, setSelectedWebsite] = useState('all');
  const [dateRange, setDateRange] = useState('last30days');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleVoucherUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleVoucherClick = (voucherId: string) => {
    setSelectedVoucherId(voucherId);
  };

  const handleCloseDetails = () => {
    setSelectedVoucherId(null);
  };

  const handleAddVoucher = () => {
    setShowAddWizard(true);
  };

  const handleCloseAddWizard = () => {
    setShowAddWizard(false);
  };

  const handleVoucherCreated = () => {
    setShowAddWizard(false);
    handleVoucherUpdated();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors flex flex-col">
      <GlobalHeader
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        selectedAuthority={selectedAuthority}
        setSelectedAuthority={setSelectedAuthority}
        selectedWebsite={selectedWebsite}
        setSelectedWebsite={setSelectedWebsite}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          theme={theme}
          activeItem="vouchers"
          onItemClick={onNavigate}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={setIsSidebarCollapsed}
        />
        
        {/* Main Content - Always mounted, visibility controlled */}
        <div 
          className={selectedVoucherId ? 'hidden' : 'flex-1'}
          style={{ 
            display: selectedVoucherId ? 'none' : 'flex',
            flexDirection: 'column'
          }}
        >
          <VouchersList
            language={language}
            theme={theme}
            isSidebarCollapsed={isSidebarCollapsed}
            onVoucherClick={handleVoucherClick}
            onAddVoucher={handleAddVoucher}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Detail View - Conditional rendering for detail view */}
        {selectedVoucherId && (
          <VoucherDetails
            voucherId={selectedVoucherId}
            language={language}
            theme={theme}
            isSidebarCollapsed={isSidebarCollapsed}
            onClose={handleCloseDetails}
            onVoucherUpdated={handleVoucherUpdated}
          />
        )}
      </div>

      {/* Add Voucher Wizard Modal */}
      {showAddWizard && (
        <AddVoucherWizard
          language={language}
          theme={theme}
          onClose={handleCloseAddWizard}
          onVoucherCreated={handleVoucherCreated}
        />
      )}
    </div>
  );
}
