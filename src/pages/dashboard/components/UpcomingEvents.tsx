import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

import { InfoTooltip } from '@/components/shared/InfoTooltip';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';
import { Link } from 'react-router-dom';
import { routes } from '@/lib/routes';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
}


export default function UpcomingEvents() {
  const { t } = useTranslation('dashboard');

  const events: Event[] = [
    {
      id: 1,
      title: 'Negev Desert Stars Festival',
      date: 'Jan 18-20, 2026',
      location: 'Ramon Crater, Mitzpe Ramon',
      image: 'https://images.unsplash.com/photo-1633088926847-435cdb7e76da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpc3JhZWwlMjBuZWdldiUyMGRlc2VydCUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NjU2MDk4ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 2,
      title: 'Be\'er Sheva International Arts Week',
      date: 'Feb 5-12, 2026',
      location: 'Be\'er Sheva Culture Center',
      image: 'https://images.unsplash.com/photo-1735956559986-dd3658c94f22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZXJ1c2FsZW0lMjBmZXN0aXZhbCUyMGN1bHR1cmV8ZW58MXx8fHwxNzY1NjA5ODg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 3,
      title: 'Negev Culinary Market',
      date: 'Feb 22-23, 2026',
      location: 'Sderot Community Center',
      image: 'https://images.unsplash.com/photo-1547516453-01c9910aafbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpc3JhZWxpJTIwZm9vZCUyMG1hcmtldHxlbnwxfHx8fDE3NjU2MDk4ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
  ];


  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900 dark:text-white">{t('upcoming_events')}</h2>
        <InfoTooltip
          content={t('upcoming_events_desc')}
          title={t('upcoming_events')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
          >
            <div className="relative h-48 overflow-hidden">
              <ImageWithFallback
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h3 className="text-gray-900 dark:text-white mb-2 line-clamp-2">{event.title}</h3>
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Calendar className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Show More Card */}
        <Link
          to={routes.eventsMgmt}
          className="bg-linear-to-br from-teal-50 to-blue-50 dark:from-teal-950/30 dark:to-blue-950/30 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:shadow-lg transition-all cursor-pointer group min-h-[320px]"
        >
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
            <p className="text-gray-900 dark:text-white mb-1">{t('view_all')}</p>
            < p className="text-sm text-gray-600 dark:text-gray-400" > View all upcoming activities</p>
          </div>
        </Link>
      </div>
    </section>
  );
}