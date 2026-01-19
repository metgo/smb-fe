import { Globe, Facebook, Instagram, Youtube, Music, ExternalLink } from 'lucide-react'
import type { FC } from 'react'

/* ---------- Types ---------- */

type Theme = 'light' | 'dark'

interface SocialMedia {
  facebook?: string
  instagram?: string
  youtube?: string
  tiktok?: string
}

interface Business {
  website?: string
  socialMedia?: SocialMedia
}

/* ---------- Props ---------- */

interface BusinessOnlinePresenceDetailsProps {
  theme: Theme
  t: (key: string) => string
  business: Business
}

/* ---------- Component ---------- */

const BusinessOnlinePresenceDetails: FC<BusinessOnlinePresenceDetailsProps> = ({ theme, t, business }) => {
  const socialLinks = [
    {
      platform: t('website'),
      url: business.website,
      icon: Globe,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      borderColor: 'border-blue-300 dark:border-blue-800',
    },
    {
      platform: t('facebook'),
      url: business.socialMedia?.facebook,
      icon: Facebook,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      borderColor: 'border-blue-300 dark:border-blue-800',
    },
    {
      platform: t('instagram'),
      url: business.socialMedia?.instagram,
      icon: Instagram,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-100 dark:bg-pink-900/30',
      borderColor: 'border-pink-300 dark:border-pink-800',
    },
    {
      platform: t('youtube'),
      url: business.socialMedia?.youtube,
      icon: Youtube,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      borderColor: 'border-red-300 dark:border-red-800',
    },
    {
      platform: t('tiktok'),
      url: business.socialMedia?.tiktok,
      icon: Music,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      borderColor: 'border-purple-300 dark:border-purple-800',
    },
  ]

  const activeSocialLinks = socialLinks.filter(link => link.url)

  if (activeSocialLinks.length === 0) {
    return (
      <div
        className={`p-8 text-center rounded-lg border ${
          theme === 'dark' ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <Globe
          className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}
        />
        <p
          className={`text-lg mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
        >
          {t('no_social_networks')}
        </p>
        <p
          className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}
        >
          {t('add_social_networks_description')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3
        className={`mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
      >
        {t('online_presence')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeSocialLinks.map(link => {
          const Icon = link.icon
          return (
            <div
              key={link.platform}
              className={`p-4 rounded-lg border ${link.borderColor} ${link.bgColor} transition-all hover:shadow-md`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <Icon className={`w-6 h-6 ${link.color}`} />
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                  >
                    {link.platform}
                  </h4>
                </div>
              </div>

              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm flex items-center gap-2 ${link.color} hover:underline break-all`}
              >
                <span className="truncate">{link.url}</span>
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BusinessOnlinePresenceDetails
