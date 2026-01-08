import { useState, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, Save, CheckCircle, Upload, X, Plus,
  MapPin, Image as ImageIcon, Clock, Globe, Mail, Phone, User,
  Tag, FileText, Users
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {TimePickerWidget} from '@/components/shared/TimePickerWidget';
import { useAppSelector } from '@/hooks/hooks';

interface CreateBusinessWizardProps {
  theme: Theme;
  onClose: () => void;
  onSave: (data: any) => void;
  editData?: any;
}

const USER_ROLE = 'admin';

export default function CreateBusinessWizard({
  theme,
  onClose,
  onSave,
  editData,
}: CreateBusinessWizardProps) {
  const { t } = useTranslation('businesses');
  const { isRTL } = useAppSelector(state => state.settings)
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    name: '',
    shortDescription: '',
    fullDescription: '',
    slug: '',
    internalNotes: '',
    categories: [] as string[],

    // Step 2: Contact & Ownership
    email: '',
    phone: '',
    website: '',
    contactPerson: {
      name: '',
      email: '',
      phone: '',
    },
    preferredChannel: 'email',
    collaborators: [] as any[],

    // Step 3: Location
    address: '',
    coordinates: { lat: 31.2518, lng: 34.7913 },

    // Step 4: Categories & Attributes
    primaryCategory: '',
    subcategories: [] as string[],
    tags: [] as string[],
    accessibility: [] as string[],
    groupTypes: [] as string[],
    serviceType: '',

    // Step 5: Media
    logo: null as string | null,
    images: [] as string[],

    // Step 6: Operating & Delivery
    operatingHours: {
      sunday: [{ open: '09:00', close: '18:00' }],
      monday: [{ open: '09:00', close: '18:00' }],
      tuesday: [{ open: '09:00', close: '18:00' }],
      wednesday: [{ open: '09:00', close: '18:00' }],
      thursday: [{ open: '09:00', close: '18:00' }],
      friday: [{ open: '09:00', close: '14:00' }],
      saturday: [] as { open: string; close: string }[],
    },
    pickupAvailable: false,
    deliveryAreas: [] as string[],
    deliveryInfo: '',
    returnPolicy: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 7;

  const steps = [
    { number: 1, title: t('step_basic_info'), icon: FileText },
    { number: 2, title: t('step_contact_ownership'), icon: Users },
    { number: 3, title: t('step_location'), icon: MapPin },
    { number: 4, title: t('step_categories_attributes'), icon: Tag },
    { number: 5, title: t('step_media'), icon: ImageIcon },
    { number: 6, title: t('step_operating_delivery'), icon: Clock },
    { number: 7, title: t('step_review_submit'), icon: CheckCircle },
  ];

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !editData) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name, editData]);

  // Populate form with edit data
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        shortDescription: editData.shortDescription || '',
        fullDescription: editData.fullDescription || '',
        slug: editData.slug || '',
        internalNotes: editData.internalNotes || '',
        categories: editData.categories || [],
        email: editData.email || '',
        phone: editData.phone || '',
        website: editData.website || '',
        contactPerson: editData.contactPerson || { name: '', email: '', phone: '' },
        preferredChannel: 'email',
        collaborators: [],
        address: editData.address || '',
        coordinates: editData.coordinates || { lat: 31.2518, lng: 34.7913 },
        primaryCategory: editData.categories?.[0] || '',
        subcategories: editData.subcategories || [],
        tags: editData.tags || [],
        accessibility: editData.accessibility || [],
        groupTypes: editData.groupTypes || [],
        serviceType: '',
        logo: editData.logo || null,
        images: editData.images || [],
        operatingHours: editData.operatingHours || {
          sunday: [{ open: '09:00', close: '18:00' }],
          monday: [{ open: '09:00', close: '18:00' }],
          tuesday: [{ open: '09:00', close: '18:00' }],
          wednesday: [{ open: '09:00', close: '18:00' }],
          thursday: [{ open: '09:00', close: '18:00' }],
          friday: [{ open: '09:00', close: '14:00' }],
          saturday: [],
        },
        pickupAvailable: false,
        deliveryAreas: [],
        deliveryInfo: '',
        returnPolicy: '',
      });
    }
  }, [editData]);

  // Validate all fields when on step 7 (review step)
  useEffect(() => {
    if (currentStep === 7) {
      validateAllFields();
    }
  }, [currentStep]);

  // Auto-save simulation
  const handleAutoSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
    }, 500);
  };

  // Validation
  const validateAllFields = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Step 1 validation
    if (!formData.name) newErrors.name = t('field_required');
    if (!formData.shortDescription) newErrors.shortDescription = t('field_required');
    if (!formData.fullDescription) newErrors.fullDescription = t('field_required');

    // Step 2 validation
    if (!formData.email) newErrors.email = t('field_required');
    if (!formData.phone) newErrors.phone = t('field_required');
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalid_email');
    }

    // Step 3 validation
    if (!formData.address) newErrors.address = t('field_required');

    // Step 4 validation
    if (!formData.primaryCategory) newErrors.primaryCategory = t('field_required');

    // Step 5 validation
    if (!formData.logo) newErrors.logo = t('field_required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name) newErrors.name = t('field_required');
      if (!formData.shortDescription) newErrors.shortDescription = t('field_required');
      if (!formData.fullDescription) newErrors.fullDescription = t('field_required');
    }

    if (step === 2) {
      if (!formData.email) newErrors.email = t('field_required');
      if (!formData.phone) newErrors.phone = t('field_required');
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = t('invalid_email');
      }
    }

    if (step === 3) {
      if (!formData.address) newErrors.address = t('field_required');
    }

    if (step === 4) {
      if (!formData.primaryCategory) newErrors.primaryCategory = t('field_required');
    }

    if (step === 5) {
      if (!formData.logo) newErrors.logo = t('field_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    handleAutoSave();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    handleAutoSave();
    onSave({ ...formData, status: 'draft' });
  };

  const handleSubmit = () => {
    if (validateAllFields()) {
      onSave({ ...formData, status: 'pending' });
    }
  };

  const canApprove = ['superadmin', 'admin', 'dmo', 'authority'].includes(USER_ROLE);

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Business Name */}
      <div>
        <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {t('business_name')} *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t('enter_event_name') || 'Enter business name'}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.name
              ? 'border-red-500'
              : theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-gray-200'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-teal-500`}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Slug */}
      <div>
        <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {t('slug')} ({t('auto_generated')})
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className={`w-full px-4 py-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-gray-200'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-teal-500`}
        />
      </div>

      {/* Short Description */}
      <div>
        <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {t('short_description')} *
        </label>
        <textarea
          value={formData.shortDescription}
          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          placeholder={t('brief_description') || 'Brief description'}
          rows={3}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.shortDescription
              ? 'border-red-500'
              : theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-gray-200'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-teal-500`}
        />
        {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription}</p>}
      </div>

      {/* Full Description */}
      <div>
        <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {t('full_description')} *
        </label>
        <textarea
          value={formData.fullDescription}
          onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
          placeholder={t('full_event_description') || 'Full description'}
          rows={6}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.fullDescription
              ? 'border-red-500'
              : theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-gray-200'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-teal-500`}
        />
        {errors.fullDescription && <p className="text-red-500 text-sm mt-1">{errors.fullDescription}</p>}
      </div>

      {/* Internal Notes */}
      {canApprove && (
        <div>
          <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('internal_notes')}
            <span className={`text-xs ml-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              ({t('visible_only_to_admins')})
            </span>
          </label>
          <textarea
            value={formData.internalNotes}
            onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
            placeholder={t('add_internal_notes') || 'Add internal notes'}
            rows={3}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Business Email */}
      <div>
        <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {t('business_email')} *
        </label>
        <div className="relative">
          <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="business@example.com"
            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 rounded-lg border ${
              errors.email
                ? 'border-red-500'
                : theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {t('phone_number')} *
        </label>
        <div className="relative">
          <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+972-XX-XXXXXXX"
            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 rounded-lg border ${
              errors.phone
                ? 'border-red-500'
                : theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      {/* Website */}
      <div>
        <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {t('website_url')}
        </label>
        <div className="relative">
          <Globe className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://example.com"
            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>
      </div>

      {/* Contact Person */}
      <div className={`p-4 rounded-lg ${
        theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
      }`}>
        <h3 className={`mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
          <User className="w-5 h-5" />
          {t('contact_person_details')}
        </h3>

        <div className="space-y-4">
          <input
            type="text"
            value={formData.contactPerson.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactPerson: { ...formData.contactPerson, name: e.target.value },
              })
            }
            placeholder={t('full_name') || 'Full Name'}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />

          <input
            type="email"
            value={formData.contactPerson.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactPerson: { ...formData.contactPerson, email: e.target.value },
              })
            }
            placeholder={t('email') || 'Email'}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />

          <input
            type="tel"
            value={formData.contactPerson.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactPerson: { ...formData.contactPerson, phone: e.target.value },
              })
            }
            placeholder={t('phone') || 'Phone'}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Address */}
      <div>
        <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {t('address')} *
        </label>
        <div className="relative">
          <MapPin className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder={t('enter_full_address') || 'Enter full address'}
            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 rounded-lg border ${
              errors.address
                ? 'border-red-500'
                : theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>
        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
      </div>

      {/* Map Placeholder */}
      <div className={`h-96 rounded-lg flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-300'
      }`}>
        <div className="text-center">
          <MapPin className={`w-12 h-12 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
            {t('google_maps_widget')}
          </p>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
            {t('search_address')}, {t('pin_location')}
          </p>
        </div>
      </div>

      {/* Coordinates Display */}
      <div className={`p-4 rounded-lg ${
        theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
      }`}>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('geo_coordinates')}: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
        </p>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Primary Category */}
      <div>
        <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {t('primary_category')} *
        </label>
        <select
          value={formData.primaryCategory}
          onChange={(e) => setFormData({ ...formData, primaryCategory: e.target.value })}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.primaryCategory
              ? 'border-red-500'
              : theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-gray-200'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-teal-500`}
        >
          <option value="">{t('select') || 'Select'}</option>
          <option value="food">Food & Dining</option>
          <option value="accommodation">Accommodation</option>
          <option value="tourism">Tourism</option>
          <option value="shopping">Shopping</option>
          <option value="culture">Culture</option>
        </select>
        {errors.primaryCategory && <p className="text-red-500 text-sm mt-1">{errors.primaryCategory}</p>}
      </div>

      {/* Service Type */}
      <div>
        <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {t('service_type')}
        </label>
        <select
          value={formData.serviceType}
          onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
          className={`w-full px-4 py-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-gray-200'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-teal-500`}
        >
          <option value="">{t('select') || 'Select'}</option>
          <option value="B2C">B2C</option>
          <option value="B2B">B2B</option>
          <option value="Both">Both</option>
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {t('tags')}
        </label>
        <div className={`p-3 rounded-lg border min-h-[100px] ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
        }`}>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400 rounded flex items-center gap-1 text-sm"
              >
                {tag}
                <button
                  onClick={() =>
                    setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== idx) })
                  }
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add tag..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  setFormData({ ...formData, tags: [...formData.tags, e.currentTarget.value] });
                  e.currentTarget.value = '';
                }
              }}
              className={`px-2 py-1 bg-transparent outline-none text-sm ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Accessibility Options */}
      <div>
        <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {t('accessibility')}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {['Wheelchair Accessible', 'Accessible Parking', 'Accessible Restrooms', 'Sign Language'].map(
            (option) => (
              <label
                key={option}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
                  formData.accessibility.includes(option)
                    ? theme === 'dark'
                      ? 'bg-teal-900/30 border-teal-600'
                      : 'bg-teal-50 border-teal-600'
                    : theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.accessibility.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ ...formData, accessibility: [...formData.accessibility, option] });
                    } else {
                      setFormData({
                        ...formData,
                        accessibility: formData.accessibility.filter((a) => a !== option),
                      });
                    }
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {option}
                </span>
              </label>
            )
          )}
        </div>
      </div>

      {/* Group Types */}
      <div>
        <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {t('group_types')}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {['Families', 'Couples', 'Groups', 'Individuals', 'Seniors', 'Corporate'].map((type) => (
            <label
              key={type}
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
                formData.groupTypes.includes(type)
                  ? theme === 'dark'
                    ? 'bg-purple-900/30 border-purple-600'
                    : 'bg-purple-50 border-purple-600'
                  : theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.groupTypes.includes(type)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, groupTypes: [...formData.groupTypes, type] });
                  } else {
                    setFormData({
                      ...formData,
                      groupTypes: formData.groupTypes.filter((g) => g !== type),
                    });
                  }
                }}
                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div>
        <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {t('logo_required')} *
        </label>
        <div className="flex items-center gap-4">
          {formData.logo ? (
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
              <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
              <button
                onClick={() => setFormData({ ...formData, logo: null })}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer ${
                errors.logo
                  ? 'border-red-500'
                  : theme === 'dark'
                  ? 'border-gray-700 hover:border-gray-600'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => {
                // Simulate upload
                setFormData({ ...formData, logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&h=200&fit=crop' });
              }}
            >
              <div className="text-center">
                <Upload className={`w-6 h-6 mx-auto mb-1 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-600' : 'text-gray-500'}`}>
                  {t('upload_logo')}
                </p>
              </div>
            </div>
          )}
        </div>
        {errors.logo && <p className="text-red-500 text-sm mt-1">{errors.logo}</p>}
      </div>

      {/* Image Gallery */}
      <div>
        <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {t('image_gallery')}
          <span className={`text-xs ml-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            ({t('upload_up_to_10_images')})
          </span>
        </label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {formData.images.map((img, idx) => (
            <div
              key={idx}
              className={`relative aspect-square rounded-lg overflow-hidden border group ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
              }`}
            >
              <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
              
              {/* Delete button */}
              <button
                onClick={() =>
                  setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })
                }
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* Primary badge */}
              {idx === 0 && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded z-10">
                  {t('primary_image')}
                </div>
              )}
              
              {/* Set as Primary button (shows on hover for non-primary images) */}
              {idx !== 0 && (
                <button
                  onClick={() => {
                    const newImages = [...formData.images];
                    const [selectedImage] = newImages.splice(idx, 1);
                    newImages.unshift(selectedImage);
                    setFormData({ ...formData, images: newImages });
                  }}
                  className="absolute bottom-2 left-2 right-2 px-3 py-1.5 bg-teal-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-teal-700"
                >
                  {t('set_as_primary') || 'Set as Primary'}
                </button>
              )}
            </div>
          ))}

          {formData.images.length < 10 && (
            <div
              className={`aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer ${
                theme === 'dark'
                  ? 'border-gray-700 hover:border-gray-600'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => {
                setFormData({
                  ...formData,
                  images: [
                    ...formData.images,
                    `https://images.unsplash.com/photo-${1500000000000 + formData.images.length}?w=400&h=400&fit=crop`,
                  ],
                });
              }}
            >
              <div className="text-center">
                <Plus className={`w-8 h-8 mx-auto mb-1 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-600' : 'text-gray-500'}`}>
                  {t('upload_images') || 'Upload'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => {
    const daysOfWeek = [
      { key: 'sunday', label: t('sunday') },
      { key: 'monday', label: t('monday') },
      { key: 'tuesday', label: t('tuesday') },
      { key: 'wednesday', label: t('wednesday') },
      { key: 'thursday', label: t('thursday') },
      { key: 'friday', label: t('friday') },
      { key: 'saturday', label: t('saturday') },
    ];

    return (
      <div className="space-y-6">
        <h3 className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
          {t('operating_hours')}
        </h3>

        {daysOfWeek.map((day) => {
          const hours = formData.operatingHours[day.key as keyof typeof formData.operatingHours];
          return (
            <div
              key={day.key}
              className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  {day.label}
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hours.length === 0}
                    onChange={(e) => {
                      const newHours = { ...formData.operatingHours };
                      if (e.target.checked) {
                        newHours[day.key as keyof typeof newHours] = [];
                      } else {
                        newHours[day.key as keyof typeof newHours] = [{ open: '09:00', close: '18:00' }];
                      }
                      setFormData({ ...formData, operatingHours: newHours });
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Closed
                  </span>
                </label>
              </div>

              {hours.length > 0 && (
                <div className="space-y-2">
                  {hours.map((range, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <TimePickerWidget
                        value={range.open}
                        onChange={(time) => {
                          const newHours = { ...formData.operatingHours };
                          const dayHours = newHours[day.key as keyof typeof newHours];
                          dayHours[idx].open = time;
                          setFormData({ ...formData, operatingHours: newHours });
                        }}
                        theme={theme}
                        isRTL={isRTL}
                      />
                      <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>to</span>
                      <TimePickerWidget
                        value={range.close}
                        onChange={(time) => {
                          const newHours = { ...formData.operatingHours };
                          const dayHours = newHours[day.key as keyof typeof newHours];
                          dayHours[idx].close = time;
                          setFormData({ ...formData, operatingHours: newHours });
                        }}
                        theme={theme}
                        isRTL={isRTL}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Additional Delivery Info */}
        <div>
          <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('delivery_additional_info')}
          </label>
          <textarea
            value={formData.deliveryInfo}
            onChange={(e) => setFormData({ ...formData, deliveryInfo: e.target.value })}
            rows={3}
            placeholder="Enter delivery information..."
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>

        {/* Return & Exchange Info */}
        <div>
          <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('return_exchange_info')}
          </label>
          <textarea
            value={formData.returnPolicy}
            onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
            rows={3}
            placeholder="Enter return and exchange policy..."
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>
      </div>
    );
  };

  const renderStep7 = () => {
    return (
      <div className="space-y-6">
        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
        }`}>
          <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
          <h3 className={`mb-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-800'}`}>
            {t('review_your_business')}
          </h3>
          <p className={theme === 'dark' ? 'text-green-300' : 'text-green-900'}>
            {t('review_business_details')}
          </p>
        </div>

        {/* Missing Fields Warning */}
        {Object.keys(errors).length > 0 && (
          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
          }`}>
            <h4 className={`mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-800'}`}>
              {t('missing_mandatory_fields')}
            </h4>
            <ul className={`list-disc list-inside text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
              {errors.name && <li>{t('business_name')}</li>}
              {errors.shortDescription && <li>{t('short_description')}</li>}
              {errors.fullDescription && <li>{t('full_description')}</li>}
              {errors.email && <li>{t('business_email')}</li>}
              {errors.phone && <li>{t('phone_number')}</li>}
              {errors.address && <li>{t('address')}</li>}
              {errors.primaryCategory && <li>{t('primary_category')}</li>}
              {errors.logo && <li>{t('logo_required')}</li>}
            </ul>
          </div>
        )}

        {/* Summary */}
        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h4 className={`mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            {t('basic_information')}
          </h4>
          <div className="space-y-2">
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('business_name')}:</span> {formData.name || t('not_set')}
            </p>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('short_description')}:</span> {formData.shortDescription || t('not_set')}
            </p>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('primary_category')}:</span> {formData.primaryCategory || t('not_set')}
            </p>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-medium">{t('address')}:</span> {formData.address || t('not_set')}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={`w-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-2xl ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
              {editData ? t('edit_business') : t('create_new_business')}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-2">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex-1 flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      step.number === currentStep
                        ? 'bg-teal-600 text-white'
                        : step.number < currentStep
                        ? 'bg-green-600 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-800 text-gray-500'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.number < currentStep ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  {step.number < totalSteps && (
                    <div
                      className={`flex-1 h-1 rounded ${
                        step.number < currentStep
                          ? 'bg-green-600'
                          : theme === 'dark'
                          ? 'bg-gray-800'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('step')} {currentStep} {t('of')} {totalSteps}: {steps[currentStep - 1].title}
          </p>

          {/* Save Status */}
          {lastSaved && (
            <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              {t('saved')} {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}
          {currentStep === 7 && renderStep7()}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <button
            onClick={handleSaveDraft}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Save className="w-4 h-4" />
            {t('save_draft')}
          </button>

          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
                  theme === 'dark'
                    ? 'border-gray-700 hover:bg-gray-800 text-gray-300'
                    : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                } ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                {t('previous')}
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className={`px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2 transition-colors ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}
              >
                {t('next')}
                {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                {t('submit_for_approval')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}