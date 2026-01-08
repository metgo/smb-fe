import { useState } from 'react';
import {
  ArrowLeft, Edit,MapPin, Phone, Mail,
  Globe, Users, Clock, Image as ImageIcon, Accessibility,
  Tag, TrendingUp, FileText, Plus, Trash2, Upload, Star, Eye
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Business } from '@/constants/data';

interface BusinessDetailsProps {
  business: Business;
  theme: Theme;
  onBack: () => void;
  onEdit: () => void;
  onCreateProduct?: () => void;
}

const USER_ROLE = 'admin'; // Can be: 'superadmin', 'admin', 'dmo', 'authority', 'business_owner'

export default function BusinessDetails({ business, theme, onBack, onEdit, onCreateProduct }: BusinessDetailsProps) {
  const { t } = useTranslation('businesses');
  const [activeTab, setActiveTab] = useState('overview');
  const [showStatusModal, setShowStatusModal] = useState(false);

  const canChangeStatus = ['superadmin', 'admin', 'dmo', 'authority'].includes(USER_ROLE);

  const tabs = [
    { id: 'overview', label: t('overview'), icon: FileText },
    { id: 'contact', label: t('contact_ownership'), icon: Users },
    { id: 'location', label: t('location_map'), icon: MapPin },
    { id: 'media', label: t('images_branding'), icon: ImageIcon },
    { id: 'accessibility', label: t('accessibility_group_types'), icon: Accessibility },
    { id: 'hours', label: t('operating_hours'), icon: Clock },
  ];

  const StatusBadge = ({ status }: { status: Business['status'] }) => {
    const statusConfig = {
      draft: { color: 'bg-gray-500', label: t('draft') },
      pending: { color: 'bg-yellow-500', label: t('pending') },
      approved: { color: 'bg-green-500', label: t('approved') },
      rejected: { color: 'bg-red-500', label: t('rejected') },
      archived: { color: 'bg-gray-400', label: t('archived') },
    };

    const config = statusConfig[status];

    return (
      <span className={`px-3 py-1 rounded-full text-sm text-white ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Short Description */}
      <div>
        <h3 className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('short_description')}
        </h3>
        <p className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>
          {business.shortDescription}
        </p>
      </div>

      {/* Full Description */}
      <div>
        <h3 className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('full_description')}
        </h3>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
          {business.fullDescription}
        </p>
      </div>

      {/* Categories */}
      <div>
        <h3 className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('categories')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {business.categories.map((cat, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-full text-sm ${theme === 'dark'
                  ? 'bg-teal-900/30 text-teal-400'
                  : 'bg-teal-100 text-teal-800'
                }`}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Subcategories */}
      {business.subcategories.length > 0 && (
        <div>
          <h3 className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('subcategories')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {business.subcategories.map((subcat, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded-full text-sm ${theme === 'dark'
                    ? 'bg-blue-900/30 text-blue-400'
                    : 'bg-blue-100 text-blue-800'
                  }`}
              >
                {subcat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {business.tags.length > 0 && (
        <div>
          <h3 className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tags')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {business.tags.map((tag, idx) => (
              <span
                key={idx}
                className={`px-2 py-1 rounded text-xs ${theme === 'dark'
                    ? 'bg-gray-800 text-gray-400'
                    : 'bg-gray-200 text-gray-700'
                  }`}
              >
                <Tag className="w-3 h-3 inline mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Impact */}
      <div>
        <h3 className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('impact')}
        </h3>
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span className={`text-2xl ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            {business.impactScore.toFixed(1)}
          </span>
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>/ 10</span>
        </div>
      </div>

      {/* Internal Notes (Admin Only) */}
      {canChangeStatus && business.internalNotes && (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'
          }`}>
          <h3 className={`text-sm mb-2 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-800'}`}>
            {t('internal_notes')}
          </h3>
          <p className={theme === 'dark' ? 'text-yellow-300' : 'text-yellow-900'}>
            {business.internalNotes}
          </p>
        </div>
      )}

      {/* Rejection Note */}
      {business.status === 'rejected' && business.rejectionNote && (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
          }`}>
          <h3 className={`text-sm mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-800'}`}>
            {t('rejection_note')}
          </h3>
          <p className={theme === 'dark' ? 'text-red-300' : 'text-red-900'}>
            {business.rejectionNote || 'No rejection note provided'}
          </p>
        </div>
      )}
    </div>
  );

  const renderContact = () => (
    <div className="space-y-6">
      {/* Business Contact */}
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
        <h3 className={`mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
          {t('business_email')}
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            <a
              href={`mailto:${business.email}`}
              className="text-teal-600 hover:text-teal-700 transition-colors"
            >
              {business.email}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Phone className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            <a
              href={`tel:${business.phone}`}
              className="text-teal-600 hover:text-teal-700 transition-colors"
            >
              {business.phone}
            </a>
          </div>

          {business.website && (
            <div className="flex items-center gap-3">
              <Globe className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 transition-colors"
              >
                {business.website}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Contact Person */}
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
        <h3 className={`mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
          {t('contact_person')}
        </h3>

        <div className="space-y-2">
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
            <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
              {t('name')}:
            </span>{' '}
            {business.contactPerson.name}
          </p>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
            <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
              {t('email')}:
            </span>{' '}
            {business.contactPerson.email}
          </p>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
            <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
              {t('phone')}:
            </span>{' '}
            {business.contactPerson.phone}
          </p>
        </div>
      </div>

      {/* Collaborators */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>
            {t('collaborators')}
          </h3>
          <button className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded transition-colors flex items-center gap-1">
            <Plus className="w-4 h-4" />
            {t('invite_user')}
          </button>
        </div>

        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          No collaborators added yet
        </p>
      </div>
    </div>
  );

  const renderLocation = () => (
    <div className="space-y-6">
      {/* Address */}
      <div>
        <h3 className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('address')}
        </h3>
        <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
          <MapPin className="w-5 h-5" />
          {business.address}
        </p>
      </div>

      {/* Coordinates */}
      <div>
        <h3 className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('geo_coordinates')}
        </h3>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
          Lat: {business.coordinates.lat.toFixed(6)}, Lng: {business.coordinates.lng.toFixed(6)}
        </p>
      </div>

      {/* Map Placeholder */}
      <div className={`h-96 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-300'
        }`}>
        <div className="text-center">
          <MapPin className={`w-12 h-12 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
            {t('google_maps_widget')}
          </p>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
            Map integration would appear here
          </p>
        </div>
      </div>
    </div>
  );

  const renderMedia = () => (
    <div className="space-y-6">
      {/* Logo */}
      <div>
        <h3 className={`mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
          {t('logo')}
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
            <img
              src={business.logo}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {t('replace_logo')}
            </button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>
            {t('image_gallery')}
          </h3>
          <button className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded transition-colors flex items-center gap-1">
            <Upload className="w-4 h-4" />
            {t('upload_images') || 'Upload'}
          </button>
        </div>

        {business.images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {business.images.map((img, idx) => (
              <div
                key={idx}
                className={`relative aspect-video rounded-lg overflow-hidden border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
                  } group`}
              >
                <img
                  src={img}
                  alt={`${business.name} ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {idx === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {t('primary_image')}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                    <Eye className="w-4 h-4 text-gray-800" />
                  </button>
                  <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`p-8 text-center rounded-lg border-2 border-dashed ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
            }`}>
            <ImageIcon className={`w-12 h-12 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
              No images uploaded yet
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAccessibility = () => (
    <div className="space-y-6">
      {/* Accessibility Options */}
      <div>
        <h3 className={`mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
          {t('accessibility')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {business.accessibility.map((option, idx) => (
            <span
              key={idx}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${theme === 'dark'
                  ? 'bg-blue-900/30 text-blue-400 border border-blue-800'
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}
            >
              <Accessibility className="w-4 h-4" />
              {option}
            </span>
          ))}
        </div>
      </div>

      {/* Group Types */}
      <div>
        <h3 className={`mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
          {t('group_types')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {business.groupTypes.map((type, idx) => (
            <span
              key={idx}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${theme === 'dark'
                  ? 'bg-purple-900/30 text-purple-400 border border-purple-800'
                  : 'bg-purple-100 text-purple-800 border border-purple-300'
                }`}
            >
              <Users className="w-4 h-4" />
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHours = () => {
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
      <div className="space-y-4">
        <h3 className={`mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
          {t('weekly_schedule')}
        </h3>

        {daysOfWeek.map((day) => {
          const hours = business.operatingHours[day.key];
          return (
            <div
              key={day.key}
              className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  {day.label}
                </span>
                <div className="flex items-center gap-2">
                  {hours && hours.length > 0 ? (
                    hours.map((range, idx) => (
                      <span
                        key={idx}
                        className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {range.open} - {range.close}
                      </span>
                    ))
                  ) : (
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      Closed
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className={`border-b ${theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'
          } px-6 py-4`}
      >
        {/* Top Row */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-sm hover:text-teal-600 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
          >
            <ArrowLeft className="w-5 h-5" />
            {t('back_to_list')}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              {t('edit')}
            </button>

            {onCreateProduct && (
              <button
                onClick={onCreateProduct}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg text-white rounded-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('create_product') || 'Create Product'}
              </button>
            )}

            {canChangeStatus && (
              <button
                onClick={() => setShowStatusModal(true)}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${theme === 'dark'
                    ? 'border-gray-700 hover:bg-gray-800 text-gray-300'
                    : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                  }`}
              >
                {t('change_status')}
              </button>
            )}
          </div>
        </div>

        {/* Business Info */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={`text-3xl mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
              {business.name}
            </h1>
            <div className="flex items-center gap-4">
              <StatusBadge status={business.status} />
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {t('impact_score')}: {business.impactScore.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Completion Percentage */}
          <div className="flex flex-col items-end">
            <span className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('completion_percentage')}
            </span>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 transition-all duration-300"
                  style={{ width: `${business.completionPercentage}%` }}
                />
              </div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {business.completionPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-t-lg flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === tab.id
                    ? theme === 'dark'
                      ? 'bg-gray-800 text-teal-400 border-b-2 border-teal-500'
                      : 'bg-gray-100 text-teal-700 border-b-2 border-teal-600'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                      : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'contact' && renderContact()}
        {activeTab === 'location' && renderLocation()}
        {activeTab === 'media' && renderMedia()}
        {activeTab === 'accessibility' && renderAccessibility()}
        {activeTab === 'hours' && renderHours()}
      </div>
    </div>
  );
}