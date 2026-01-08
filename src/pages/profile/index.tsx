import { useAppSelector } from '@/hooks/hooks';
import { routes } from '@/lib/routes';
import { Mail, Phone, Building2, MapPin, Calendar, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Mock user data - in a real app, this would come from authentication context
const user = {
  name: 'Admin User',
  email: 'admin@metgo.app',
  phone: '+972-50-123-4567',
  role: 'Super Administrator',
  userType: 'Authority Manager',
  businessName: 'MetGo LTD',
  location: 'Western Negev, Israel',
  joinedDate: 'January 2024',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
};


export default function ProfilePage() {
  const { t } = useTranslation('profile');
  const navigate = useNavigate()

  const { theme, isRTL } = useAppSelector((state) => state.settings)
  const { isSidebarCollapsed } = useAppSelector((state) => state.ui)


  const onLogout = () => {
    localStorage.removeItem("userData")
    navigate(routes.auth)
  }


  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-all duration-300 ${isRTL
      ? (isSidebarCollapsed ? 'mr-16' : 'mr-64')
      : (isSidebarCollapsed ? 'ml-16' : 'ml-64')
      }`}>
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-8 mb-6`}>
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-teal-500"
              />
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className={`text-3xl mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {user.name}
              </h1>
              <p className={`text-lg mb-1 ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>
                {user.role}
              </p>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {user.userType}
              </p>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('logout') || 'Logout'}</span>
            </button>
          </div>
        </div>

        {/* Contact Information */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-8 mb-6`}>
          <h2 className={`text-2xl mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('contact_information') || 'Contact Information'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Mail className={`w-6 h-6 ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`} />
              </div>
              <div>
                <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('email') || 'Email'}
                </p>
                <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {user.email}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Phone className={`w-6 h-6 ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`} />
              </div>
              <div>
                <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('phone') || 'Phone'}
                </p>
                <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {user.phone}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <MapPin className={`w-6 h-6 ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`} />
              </div>
              <div>
                <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('location') || 'Location'}
                </p>
                <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {user.location}
                </p>
              </div>
            </div>

            {/* Joined Date */}
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Calendar className={`w-6 h-6 ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`} />
              </div>
              <div>
                <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('member_since') || 'Member Since'}
                </p>
                <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {user.joinedDate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-8`}>
          <h2 className={`text-2xl mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('business_information') || 'Business Information'}
          </h2>

          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Building2 className={`w-6 h-6 ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`} />
            </div>
            <div>
              <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('business_name') || 'Business Name'}
              </p>
              <p className={`text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {user.businessName}
              </p>
            </div>
          </div>

          {/* Additional Business Details */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('user_type') || 'User Type'}
                </p>
                <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {user.userType}
                </p>
              </div>
              <div>
                <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('access_level') || 'Access Level'}
                </p>
                <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
