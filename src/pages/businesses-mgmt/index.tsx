import { useState } from 'react';

import { useAppSelector } from '@/hooks/hooks';

import {BusinessDetails, BusinessesList, CreateBusinessWizard} from './components';
import type { Business } from '@/constants/data';


type View = 'list' | 'details' | 'create' | 'edit';

export default function BusinessesMgmtPage() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const { theme } = useAppSelector((state) => state.settings)

  const handleBusinessClick = (business: Business) => {
    setSelectedBusiness(business);
    setCurrentView('details');
  };

  const handleCreateNew = () => {
    setSelectedBusiness(null);
    setCurrentView('create');
  };

  const handleEdit = () => {
    setCurrentView('edit');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedBusiness(null);
  };

  const handleSave = (data: any) => {
    console.log('Saving business:', data);
    setCurrentView('list');
    setSelectedBusiness(null);
  };

  const handleCloseWizard = () => {
    setCurrentView('list');
    setSelectedBusiness(null);
  };

  const handleCreateProduct = () => {
   console.log("adfasfjkljsdfs lajflsadjl asdfas")
  };

  return (
    <>
      {currentView === 'list' && (
        <BusinessesList
          theme={theme}
          onBusinessClick={handleBusinessClick}
          onCreateNew={handleCreateNew}
        />
      )}

      {currentView === 'details' && selectedBusiness && (
        <BusinessDetails
          business={selectedBusiness}
          theme={theme}
          onBack={handleBackToList}
          onEdit={handleEdit}
          onCreateProduct={handleCreateProduct}
        />
      )}

      {(currentView === 'create' || currentView === 'edit') && (
        <CreateBusinessWizard
          theme={theme}
          onClose={handleCloseWizard}
          onSave={handleSave}
          editData={currentView === 'edit' ? selectedBusiness : undefined}
        />
      )}
    </>
  );
}