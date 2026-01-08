import { useState } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Check, Upload, 
  Image as ImageIcon, Globe, Package, Truck, Eye
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProductFormData {
  // Basic Info
  businessId: string;
  name: {
    en: string;
    he: string;
    ar: string;
  };
  shortDescription: {
    en: string;
    he: string;
    ar: string;
  };
  fullDescription: {
    en: string;
    he: string;
    ar: string;
  };
  
  // Type & Category
  type: 'physical' | 'table-order' | 'service' | 'hotel-room' | 'experience' | '';
  categories: string[];
  
  // Pricing
  markedPrice: string;
  sellingPrice: string;
  quantity: string;
  isUnlimited: boolean;
  startDate: string;
  endDate: string;
  
  // Media
  mainImage: string | null;
  additionalImages: string[];
  
  // Delivery/Service
  enableHomeDelivery: boolean;
  enableStorePickup: boolean;
  deliveryFee: string;
  deliveryTime: string;
  serviceDuration: string;
  serviceLocation: string;
}

interface ProductWizardProps {
  language: Language;
  theme: 'light' | 'dark';
  onClose: () => void;
  onSubmit: (data: ProductFormData, status: 'draft' | 'pending') => void;
  editingProduct?: ProductFormData | null;
  preSelectedBusinessName?: string | null;
}

export default function ProductWizard({
  language,
  theme,
  onClose,
  onSubmit,
  editingProduct,
  preSelectedBusinessName
}: ProductWizardProps) {
  const { t } = useTranslation('products');
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Mock businesses and categories
  const businesses = [
    { id: 'biz-1', name: 'Desert Lodge Hotel' },
    { id: 'biz-2', name: 'Ramon Crater Restaurant' },
    { id: 'biz-3', name: 'Negev Adventure Tours' },
    { id: 'biz-4', name: 'Be\'er Sheva Wellness Spa' },
    { id: 'biz-5', name: 'Sderot Artisan Market' },
  ];

  // Find pre-selected business ID if name is provided
  const preSelectedBusinessId = preSelectedBusinessName 
    ? businesses.find(b => b.name === preSelectedBusinessName)?.id || ''
    : '';
  
  const [formData, setFormData] = useState<ProductFormData>(
    editingProduct || {
      businessId: preSelectedBusinessId,
      name: { en: '', he: '', ar: '' },
      shortDescription: { en: '', he: '', ar: '' },
      fullDescription: { en: '', he: '', ar: '' },
      type: '',
      categories: [],
      markedPrice: '',
      sellingPrice: '',
      quantity: '',
      isUnlimited: false,
      startDate: '',
      endDate: '',
      mainImage: null,
      additionalImages: [],
      enableHomeDelivery: false,
      enableStorePickup: false,
      deliveryFee: '',
      deliveryTime: '',
      serviceDuration: '',
      serviceLocation: ''
    }
  );

  // Theme classes
  const bgSecondary = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const bgTertiary = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const textTertiary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50';

  const steps = [
    { number: 1, title: t('product_basic_info'), icon: Package },
    { number: 2, title: t('product_type_category'), icon: Package },
    { number: 3, title: t('product_pricing'), icon: Package },
    { number: 4, title: t('product_media'), icon: ImageIcon },
    { number: 5, title: t('product_multilingual'), icon: Globe },
    { number: 6, title: t('product_delivery_service'), icon: Truck },
    { number: 7, title: t('product_review'), icon: Eye }
  ];

  // Validation for each step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.businessId) newErrors.businessId = t('field_required');
        if (!formData.name.en) newErrors.nameEn = t('field_required');
        if (!formData.shortDescription.en) newErrors.shortDescEn = t('field_required');
        break;
        
      case 2: // Type & Category
        if (!formData.type) newErrors.type = t('field_required');
        if (formData.categories.length === 0) newErrors.categories = t('select_at_least_one_category');
        break;
        
      case 3: // Pricing
        if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
          newErrors.sellingPrice = t('invalid_price');
        }
        if (!formData.isUnlimited && (!formData.quantity || parseInt(formData.quantity) < 0)) {
          newErrors.quantity = t('invalid_quantity');
        }
        break;
        
      case 4: // Media
        if (!formData.mainImage) newErrors.mainImage = t('upload_at_least_one_image');
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 7) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (status: 'draft' | 'pending') => {
    if (status === 'pending' && !validateStep(currentStep)) {
      return;
    }
    onSubmit(formData, status);
  };

  const handleImageUpload = (file: File, type: 'main' | 'additional') => {
    // In production, this would upload to a server
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      if (type === 'main') {
        setFormData({ ...formData, mainImage: imageUrl });
      } else {
        setFormData({ 
          ...formData, 
          additionalImages: [...formData.additionalImages, imageUrl] 
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const availableCategories = [
    'Food & Dining', 'Accommodation', 'Tours & Activities',
    'Shopping', 'Wellness & Spa', 'Entertainment'
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Basic Info
        return (
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                {t('select_business')} *
              </label>
              <select
                value={formData.businessId}
                onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
              >
                <option value="">{t('select_business')}</option>
                {businesses.map(biz => (
                  <option key={biz.id} value={biz.id}>{biz.name}</option>
                ))}
              </select>
              {errors.businessId && <p className="text-red-500 text-sm mt-1">{errors.businessId}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                {t('product_name')} (English) *
              </label>
              <input
                type="text"
                value={formData.name.en}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  name: { ...formData.name, en: e.target.value }
                })}
                className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                placeholder="Enter product name in English"
              />
              {errors.nameEn && <p className="text-red-500 text-sm mt-1">{errors.nameEn}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                {t('product_short_description')} (English) *
              </label>
              <textarea
                value={formData.shortDescription.en}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  shortDescription: { ...formData.shortDescription, en: e.target.value }
                })}
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                placeholder="Brief description (max 160 characters)"
                maxLength={160}
              />
              {errors.shortDescEn && <p className="text-red-500 text-sm mt-1">{errors.shortDescEn}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                {t('product_full_description')} (English)
              </label>
              <textarea
                value={formData.fullDescription.en}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  fullDescription: { ...formData.fullDescription, en: e.target.value }
                })}
                rows={6}
                className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                placeholder="Detailed product description"
              />
            </div>
          </div>
        );

      case 2: // Type & Category
        return (
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                {t('select_product_type')} *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { value: 'physical', label: t('physical_product'), icon: '📦' },
                  { value: 'table-order', label: t('table_order'), icon: '🍽️' },
                  { value: 'service', label: t('service'), icon: '⚡' },
                  { value: 'hotel-room', label: t('hotel_room'), icon: '🏨' },
                  { value: 'experience', label: t('experience'), icon: '🎭' }
                ].map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value as any })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.type === type.value
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30'
                        : `${borderColor} ${hoverBg}`
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className={`font-medium ${textPrimary}`}>{type.label}</div>
                  </button>
                ))}
              </div>
              {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                {t('select_categories')} *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableCategories.map(category => (
                  <label
                    key={category}
                    className={`flex items-center gap-2 p-3 rounded-lg border ${borderColor} cursor-pointer ${hoverBg}`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ 
                            ...formData, 
                            categories: [...formData.categories, category] 
                          });
                        } else {
                          setFormData({ 
                            ...formData, 
                            categories: formData.categories.filter(c => c !== category) 
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <span className={`text-sm ${textSecondary}`}>{category}</span>
                  </label>
                ))}
              </div>
              {errors.categories && <p className="text-red-500 text-sm mt-1">{errors.categories}</p>}
            </div>
          </div>
        );

      case 3: // Pricing & Availability
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  {t('marked_price')} (₪)
                </label>
                <input
                  type="number"
                  value={formData.markedPrice}
                  onChange={(e) => setFormData({ ...formData, markedPrice: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  {t('selling_price')} (₪) *
                </label>
                <input
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                {errors.sellingPrice && <p className="text-red-500 text-sm mt-1">{errors.sellingPrice}</p>}
              </div>
            </div>

            <div>
              <label className={`flex items-center gap-2 mb-3`}>
                <input
                  type="checkbox"
                  checked={formData.isUnlimited}
                  onChange={(e) => setFormData({ ...formData, isUnlimited: e.target.checked })}
                  className="rounded"
                />
                <span className={`text-sm font-medium ${textSecondary}`}>{t('unlimited_stock')}</span>
              </label>

              {!formData.isUnlimited && (
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    {t('stock_quantity')} *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                </div>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-3`}>
                {t('availability_dates')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs ${textTertiary} mb-1`}>{t('start_date')}</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs ${textTertiary} mb-1`}>{t('end_date')}</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Media
        return (
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                {t('upload_main_image')} *
              </label>
              <div 
                className={`border-2 border-dashed ${borderColor} rounded-xl p-8 text-center ${hoverBg} cursor-pointer transition-colors`}
                onClick={() => document.getElementById('main-image-input')?.click()}
              >
                {formData.mainImage ? (
                  <div className="relative">
                    <img 
                      src={formData.mainImage} 
                      alt="Main product" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({ ...formData, mainImage: null });
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className={`w-12 h-12 mx-auto mb-4 ${textTertiary}`} />
                    <p className={`${textSecondary} mb-2`}>{t('drag_drop_images')}</p>
                    <p className={`text-xs ${textTertiary}`}>PNG, JPG, WEBP up to 10MB</p>
                  </>
                )}
              </div>
              <input
                id="main-image-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, 'main');
                }}
                className="hidden"
              />
              {errors.mainImage && <p className="text-red-500 text-sm mt-1">{errors.mainImage}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                {t('upload_additional_images')}
              </label>
              <div 
                className={`border-2 border-dashed ${borderColor} rounded-xl p-6 text-center ${hoverBg} cursor-pointer transition-colors`}
                onClick={() => document.getElementById('additional-images-input')?.click()}
              >
                <Upload className={`w-8 h-8 mx-auto mb-2 ${textTertiary}`} />
                <p className={`text-sm ${textSecondary}`}>Upload up to 5 additional images</p>
              </div>
              <input
                id="additional-images-input"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(file => handleImageUpload(file, 'additional'));
                }}
                className="hidden"
              />

              {formData.additionalImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {formData.additionalImages.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img src={img} alt={`Additional ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      <button
                        onClick={() => setFormData({ 
                          ...formData, 
                          additionalImages: formData.additionalImages.filter((_, i) => i !== idx) 
                        })}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 5: // Multilingual Content
        return (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${bgTertiary} border ${borderColor}`}>
              <p className={`text-sm ${textSecondary}`}>
                <Globe className="w-4 h-4 inline mr-2" />
                {t('complete_all_languages')}
              </p>
            </div>

            {/* Hebrew */}
            <div className={`p-4 rounded-xl border ${borderColor}`}>
              <h3 className={`text-lg font-medium ${textPrimary} mb-4`}>עברית (Hebrew)</h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm ${textSecondary} mb-2`}>{t('product_name')}</label>
                  <input
                    type="text"
                    value={formData.name.he}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      name: { ...formData.name, he: e.target.value }
                    })}
                    className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className={`block text-sm ${textSecondary} mb-2`}>{t('product_short_description')}</label>
                  <textarea
                    value={formData.shortDescription.he}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      shortDescription: { ...formData.shortDescription, he: e.target.value }
                    })}
                    rows={2}
                    className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                    dir="rtl"
                    maxLength={160}
                  />
                </div>
              </div>
            </div>

            {/* Arabic */}
            <div className={`p-4 rounded-xl border ${borderColor}`}>
              <h3 className={`text-lg font-medium ${textPrimary} mb-4`}>العربية (Arabic)</h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm ${textSecondary} mb-2`}>{t('product_name')}</label>
                  <input
                    type="text"
                    value={formData.name.ar}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      name: { ...formData.name, ar: e.target.value }
                    })}
                    className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className={`block text-sm ${textSecondary} mb-2`}>{t('product_short_description')}</label>
                  <textarea
                    value={formData.shortDescription.ar}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      shortDescription: { ...formData.shortDescription, ar: e.target.value }
                    })}
                    rows={2}
                    className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                    dir="rtl"
                    maxLength={160}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 6: // Delivery & Service
        return (
          <div className="space-y-6">
            {(formData.type === 'physical' || formData.type === 'table-order') && (
              <>
                <h3 className={`text-lg font-medium ${textPrimary}`}>{t('delivery_options')}</h3>
                <div className="space-y-4">
                  <label className={`flex items-center gap-3 p-4 rounded-xl border ${borderColor} cursor-pointer ${hoverBg}`}>
                    <input
                      type="checkbox"
                      checked={formData.enableHomeDelivery}
                      onChange={(e) => setFormData({ ...formData, enableHomeDelivery: e.target.checked })}
                      className="rounded"
                    />
                    <div>
                      <div className={`font-medium ${textPrimary}`}>{t('enable_home_delivery')}</div>
                      <div className={`text-sm ${textTertiary}`}>Deliver products to customer's address</div>
                    </div>
                  </label>

                  {formData.enableHomeDelivery && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-8">
                      <div>
                        <label className={`block text-sm ${textSecondary} mb-2`}>{t('delivery_fee')} (₪)</label>
                        <input
                          type="number"
                          value={formData.deliveryFee}
                          onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                          className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm ${textSecondary} mb-2`}>{t('estimated_delivery_time')}</label>
                        <input
                          type="text"
                          value={formData.deliveryTime}
                          onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                          className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                          placeholder="e.g. 30-45 minutes"
                        />
                      </div>
                    </div>
                  )}

                  <label className={`flex items-center gap-3 p-4 rounded-xl border ${borderColor} cursor-pointer ${hoverBg}`}>
                    <input
                      type="checkbox"
                      checked={formData.enableStorePickup}
                      onChange={(e) => setFormData({ ...formData, enableStorePickup: e.target.checked })}
                      className="rounded"
                    />
                    <div>
                      <div className={`font-medium ${textPrimary}`}>{t('enable_store_pickup')}</div>
                      <div className={`text-sm ${textTertiary}`}>Allow customers to pick up from store</div>
                    </div>
                  </label>
                </div>
              </>
            )}

            {(formData.type === 'service' || formData.type === 'experience') && (
              <>
                <h3 className={`text-lg font-medium ${textPrimary}`}>{t('service_details')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>{t('service_duration')}</label>
                    <input
                      type="text"
                      value={formData.serviceDuration}
                      onChange={(e) => setFormData({ ...formData, serviceDuration: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                      placeholder="e.g. 2 hours"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>{t('service_location')}</label>
                    <input
                      type="text"
                      value={formData.serviceLocation}
                      onChange={(e) => setFormData({ ...formData, serviceLocation: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                      placeholder="Service location or address"
                    />
                  </div>
                </div>
              </>
            )}

            {formData.type === 'hotel-room' && (
              <div className={`p-6 rounded-xl ${bgTertiary} text-center`}>
                <p className={`${textSecondary}`}>
                  Hotel room settings are configured in the main business settings
                </p>
              </div>
            )}
          </div>
        );

      case 7: // Review & Submit
        return (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-500`}>
              <p className={`text-sm ${textSecondary}`}>
                <Eye className="w-4 h-4 inline mr-2" />
                {t('review_your_product')}
              </p>
            </div>

            <div className={`rounded-xl border ${borderColor} overflow-hidden`}>
              {formData.mainImage && (
                <img src={formData.mainImage} alt="Product" className="w-full h-64 object-cover" />
              )}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className={`text-2xl font-semibold ${textPrimary} mb-2`}>
                    {formData.name[language] || formData.name.en}
                  </h3>
                  <p className={`${textSecondary}`}>
                    {formData.shortDescription[language] || formData.shortDescription.en}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${textTertiary}`}>{t('product_type')}</p>
                    <p className={`font-medium ${textPrimary}`}>
                      {formData.type ? t(formData.type === 'physical' ? 'physical_product' : 
                        formData.type === 'table-order' ? 'table_order' :
                        formData.type === 'service' ? 'service' :
                        formData.type === 'hotel-room' ? 'hotel_room' : 'experience') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${textTertiary}`}>{t('price')}</p>
                    <p className={`font-medium ${textPrimary}`}>
                      {formData.markedPrice && formData.markedPrice !== formData.sellingPrice && (
                        <span className="line-through text-gray-400 mr-2">₪{formData.markedPrice}</span>
                      )}
                      <span className="text-teal-600 dark:text-teal-400">₪{formData.sellingPrice}</span>
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${textTertiary}`}>{t('quantity')}</p>
                    <p className={`font-medium ${textPrimary}`}>
                      {formData.isUnlimited ? t('unlimited') : formData.quantity}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${textTertiary}`}>{t('categories')}</p>
                    <p className={`font-medium ${textPrimary}`}>
                      {formData.categories.join(', ') || '-'}
                    </p>
                  </div>
                </div>

                {formData.fullDescription.en && (
                  <div>
                    <p className={`text-sm ${textTertiary} mb-2`}>{t('description')}</p>
                    <p className={`${textSecondary}`}>
                      {formData.fullDescription[language] || formData.fullDescription.en}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${bgSecondary} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col`}>
        {/* Header */}
        <div className={`p-6 border-b ${borderColor} flex items-center justify-between`}>
          <div>
            <h2 className={`text-2xl ${textPrimary} mb-1`}>
              {editingProduct ? t('edit_product') : t('create_product')}
            </h2>
            <p className={`text-sm ${textTertiary}`}>
              {t('step')} {currentStep} {t('step_of')} 7: {steps[currentStep - 1].title}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${hoverBg} ${textSecondary}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className={`px-6 pt-4 pb-2 border-b ${borderColor}`}>
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex-1">
                <div className="flex items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      currentStep === step.number
                        ? 'bg-teal-500 text-white'
                        : currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : `${bgTertiary} ${textTertiary}`
                    }`}
                  >
                    {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      currentStep > step.number ? 'bg-green-500' : bgTertiary
                    }`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${borderColor} flex items-center justify-between gap-4`}>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg border ${borderColor} ${textSecondary} ${hoverBg} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
          >
            <ChevronLeft className="w-4 h-4" />
            {t('previous_step')}
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit('draft')}
              className={`px-6 py-3 rounded-lg border ${borderColor} ${textSecondary} ${hoverBg}`}
            >
              {t('save_as_draft')}
            </button>

            {currentStep === 7 ? (
              <button
                onClick={() => handleSubmit('pending')}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                {t('submit_for_approval')}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                {t('next_step')}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}