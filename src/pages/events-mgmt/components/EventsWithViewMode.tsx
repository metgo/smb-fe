import { useState, useMemo } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Grid3x3, List,
  Clock, MapPin, Users, DollarSign, X,
  AlertCircle,
  CheckCircle,
  XCircle,
  CalendarRange,
  Grid2x2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/hooks';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';
import { useThemeClasses } from '@/hooks/useThemeClasses';
import { formatDateRange } from '@/helpers/formatter';
import { Button } from '@/components/ui/button';
import { ReordableDataTable } from '@/components/shared/ReordableDataTable';


interface EventsWithViewModeProps {
  events: Event[];
  selectedWebsiteCount: number;
  eventTypeFilter: string;
  registrationFilter: string;
  statusFilter: string;
  searchQuery: string;
}

type ViewMode = 'calendar-month' | 'calendar-week' | 'calendar-day' | 'list' | 'grid';

const VIEW_MODES: {
  key: ViewMode;
  label: string;
  icon: React.ElementType;
}[] = [
    { key: 'list', label: 'list_view', icon: List },
    { key: 'grid', label: 'grid_view', icon: Grid2x2 },
    { key: 'calendar-month', label: 'month_view', icon: Calendar }, // 📅 month icon
    { key: 'calendar-week', label: 'week_view', icon: Grid3x3 },
    { key: 'calendar-day', label: 'day_view', icon: Clock },
  ];

const WEEKDAY_LABELS: Record<string, string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  he: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'],
  ar: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
};

const CATEGORY_COLORS: Record<string, { ribbon: string }> = {
  Culture: { ribbon: 'bg-purple-600' },
  Arts: { ribbon: 'bg-pink-600' },
  Food: { ribbon: 'bg-orange-600' },
  Music: { ribbon: 'bg-fuchsia-600' },
  Heritage: { ribbon: 'bg-amber-600' },
  Sports: { ribbon: 'bg-green-600' },
  Wellness: { ribbon: 'bg-teal-600' },
  Nature: { ribbon: 'bg-lime-600' },
  Adventure: { ribbon: 'bg-red-600' },
  Entertainment: { ribbon: 'bg-blue-600' },
};

const getCategoryColor = (category: string) => {
  return CATEGORY_COLORS[category] || { ribbon: 'bg-gray-600' };
};

export default function EventsWithViewMode({
  events,
  selectedWebsiteCount,
  eventTypeFilter,
  registrationFilter,
  statusFilter,
  searchQuery,
}: EventsWithViewModeProps) {
  const { t, i18n } = useTranslation('events');
  const { isRTL } = useAppSelector((state) => state.settings);
  const language = i18n.language || 'en';
  const themeColor = useThemeClasses()

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [displayedListCount, setDisplayedListCount] = useState(12);

  // Current month/year string
  const monthYear = useMemo(() => {
    return currentDate.toLocaleDateString(
      language === 'ar' ? 'ar-EG' : language === 'he' ? 'he-IL' : 'en-US',
      { month: 'long', year: 'numeric' }
    );
  }, [currentDate, language]);

  // Navigation
  const goPrevious = () => {
    if (viewMode === 'calendar-month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'calendar-week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const goNext = () => {
    if (viewMode === 'calendar-month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'calendar-week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  const goToday = () => setCurrentDate(new Date());
  // Lazy load events
  const displayedEvents = events;

  // Month view days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay(); // 0 = Sunday

    const days: (Date | null)[] = [];

    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));

    return days;
  }, [currentDate]);

  // Week view days
  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    const weekday = start.getDay();
    start.setDate(start.getDate() - weekday);

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  }, [currentDate]);

  // Events on a given date
  const eventsOnDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => {
      const start = new Date(e.startDate).toISOString().split('T')[0];
      const end = new Date(e.endDate).toISOString().split('T')[0];
      return dateStr >= start && dateStr <= end;
    });
  };

  // Upcoming events for list view
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events
      .filter(e => new Date(e.startDate) >= today)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      language === 'ar' ? 'ar-EG' : language === 'he' ? 'he-IL' : 'en-US',
      { month: 'short', day: 'numeric', year: 'numeric' }
    );
  };

  // Month View
  const MonthView = () => (
    <div className="grid grid-cols-7 gap-1 px-4 py-6">
      {WEEKDAY_LABELS[language].map(day => (
        <div key={day} className="py-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
          {day}
        </div>
      ))}
      {calendarDays.map((day, i) => {
        if (!day) return <div key={`empty-${i}`} className="aspect-square" />;

        const dayEvents = eventsOnDate(day);
        const isToday = day.toDateString() === new Date().toDateString();
        const isCurrentMonth = day.getMonth() === currentDate.getMonth();

        return (
          <div
            key={i}
            className={`aspect-square  rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${isToday ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-500' : 'border-gray-200 dark:border-gray-700'
              } ${!isCurrentMonth ? 'opacity-50' : ''}`}
          >
            <div className={`text-sm text-center font-medium mb-1 ${isToday ? 'text-teal-600' : ''}`}>
              {day.getDate()}
            </div>
            <div className="space-y-1 text-xs">
              {dayEvents.slice(0, 3).map(event => {
                const { ribbon } = getCategoryColor(event.category);
                return (
                  <div
                    key={event.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                    className={`px-1 py-0.5 ${ribbon} text-white rounded truncate cursor-pointer`}
                    title={event.name}
                  >
                    {event.name}
                  </div>
                );
              })}
              {dayEvents.length > 3 && (
                <div className="text-gray-500">+{dayEvents.length - 3} {t('more')}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Week View
  const WeekView = () => (
    <div className="grid grid-cols-7 gap-4 px-4 py-6">
      {weekDays.map((day, i) => {
        const dayEvents = eventsOnDate(day);
        const isToday = day.toDateString() === new Date().toDateString();

        return (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 min-h-64">
            <div className={`text-center mb-3 ${isToday ? 'text-teal-600 font-bold' : ''}`}>
              <div className="text-xs text-gray-500">{WEEKDAY_LABELS[language][i]}</div>
              <div className="text-xl">{day.getDate()}</div>
            </div>
            <div className="space-y-2">
              {dayEvents.map(event => {
                const { ribbon } = getCategoryColor(event.category);
                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`p-2 ${ribbon} text-white rounded text-xs cursor-pointer`}
                  >
                    <div className="font-medium truncate">{event.name}</div>
                    <div>{event.startTime} - {event.endTime}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Day View
  const DayView = () => {
    const dayEvents = eventsOnDate(currentDate);
    const dayLabel = currentDate.toLocaleDateString(
      language === 'ar' ? 'ar-EG' : language === 'he' ? 'he-IL' : 'en-US',
      { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    );

    return (
      <div className='py-6 px-4'>
        <h3 className="text-2xl font-semibold mb-6">{dayLabel}</h3>
        {dayEvents.length === 0 ? (
          <div className="text-center py-20 text-gray-500">{t('noEventsThisDay')}</div>
        ) : (
          <div className="space-y-6">
            {dayEvents.map(event => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-md cursor-pointer transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-medium mb-3">{event.name}</h4>
                    <div className="space-y-2 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        {event.startTime} - {event.endTime}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${event.isFree ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                    {event.isFree ? t('free') : `₪${event.price}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // List View
  const GridView = () => {
    const displayed = upcomingEvents.slice(0, displayedListCount);

    return (
      <div className='py-6 px-4'>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayed.map(event => {
            const { ribbon } = getCategoryColor(event.category);

            return (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className="relative h-52">
                  {event.image ? (
                    <ImageWithFallback
                      src={event.image}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <Calendar className="w-20 h-20 text-white/40" />
                    </div>
                  )}
                  <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} ${ribbon} text-white px-4 py-1.5 text-xs font-medium rounded shadow-lg`}>
                    {event.category}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-3 line-clamp-2">{event.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(event.startDate)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                  <div className="mt-5 flex justify-between items-center">
                    <span className={`font-medium ${event.isFree ? 'text-emerald-600' : 'text-purple-600'}`}>
                      {event.isFree ? t('free') : `₪${event.price}`}
                    </span>
                    {event.registrationRequired && (
                      <div className="text-xs text-gray-500">
                        {event.totalRegistrations}/{event.capacity}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {upcomingEvents.length > displayedListCount && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setDisplayedListCount(prev => prev + 12)}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              {t('loadMore')}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Grid View
  const ListView = () => {
    return (
      <>
        {/* Error/Empty States */}
        {events.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${themeColor.textTertiary}`} />
            <h3 className={`text-lg mb-2 ${themeColor.textPrimary}`}>{t('no_events_found')}</h3>
            <p className={themeColor.textTertiary}>
              {searchQuery || selectedWebsiteCount > 0 || eventTypeFilter !== 'all' ||
                registrationFilter !== 'all' || statusFilter !== 'all'
                ? t('no_events_found_desc')
                : t('no_events_available')}
            </p>
          </div>
        )}

        <ReordableDataTable
          rowKey="id"
          data={displayedEvents}
          selectedItems={selectedEvents}
          onSelectionChange={setSelectedEvents}
          onRowClick={setSelectedEvent}
          storageKey="eventsTableColumnOrder"
          columns={[
            { key: 'checkbox', label: '', width: '50px' },
            {
              key: 'event_name',
              label: t('event_name'),
              sortable: true,
              render: (event) => (
                <div className="flex items-center gap-2">
                  {event.isMultiDay && (
                    <CalendarRange className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  )}
                  <span className="text-sm line-clamp-2">{event.name}</span>
                </div>
              ),
            },
            {
              key: 'website',
              label: t('website'),
              render: (event) => (
                <span className="text-xs sm:text-sm text-gray-500">
                  {event.website || '-'}
                </span>
              ),
            },
            {
              key: 'date',
              label: t('date'),
              sortable: true,
              render: (event) =>
                formatDateRange(
                  event.startDate,
                  event.endDate,
                  event.isMultiDay
                ),
            },
            {
              key: 'time',
              label: t('time'),
              render: (event) => (
                <span className="text-xs sm:text-sm">
                  {event.startTime} – {event.endTime}
                </span>
              ),
            },
            {
              key: 'price',
              label: t('price'),
              sortable: true,
              render: (event) =>
                event.isFree ? (
                  <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">
                    {t('free')}
                  </span>
                ) : (
                  <span className="font-medium">₪{event.price}</span>
                ),
            },
            {
              key: 'registration',
              label: t('registration'),
              render: (event) =>
                event.registrationRequired ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400 mx-auto" />
                ),
            },
            {
              key: 'status',
              label: t('status'),
              sortable: true,
              render: (event) => (
                <span
                  className={`px-2 py-1 rounded-full text-xs ${event.status === 'upcoming'
                    ? 'bg-blue-500/20 text-blue-500'
                    : event.status === 'past'
                      ? 'bg-gray-500/20 text-gray-500'
                      : 'bg-red-500/20 text-red-500'
                    }`}
                >
                  {event.status === 'upcoming'
                    ? t('upcoming_status')
                    : event.status === 'past'
                      ? t('past_status')
                      : t('canceled_status')}
                </span>
              ),
            },
            {
              key: 'registrations',
              label: t('registrations'),
              sortable: true,
              render: (event) => (
                <div className="text-right">
                  {event.totalRegistrations.toLocaleString()}
                  {event.capacity > 0 && (
                    <span className="text-xs text-gray-400 ml-1">
                      / {event.capacity.toLocaleString()}
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: 'revenue',
              label: t('revenue'),
              sortable: true,
              render: (event) =>
                event.revenue > 0
                  ? `₪${(event.revenue / 1000).toFixed(1)}K`
                  : '-',
            },
          ]}
        />

      </>
    )
  }

  // Event Modal
  const EventModal = () => selectedEvent && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="relative h-64 rounded-t-2xl overflow-hidden">
          {selectedEvent.image ? (
            <ImageWithFallback src={selectedEvent.image} alt={selectedEvent.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Calendar className="w-32 h-32 text-white/30" />
            </div>
          )}
          <button
            onClick={() => setSelectedEvent(null)}
            className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6">{selectedEvent.name}</h2>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Calendar className="w-6 h-6 text-purple-500" />
              <div>
                <div className="font-medium">
                  {formatDate(selectedEvent.startDate)}
                  {selectedEvent.startDate !== selectedEvent.endDate && ` – ${formatDate(selectedEvent.endDate)}`}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {selectedEvent.startTime} – {selectedEvent.endTime}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <MapPin className="w-6 h-6 text-purple-500" />
              <div className="font-medium">{selectedEvent.location}</div>
            </div>

            <div className="flex items-center gap-4">
              <DollarSign className="w-6 h-6 text-purple-500" />
              <div className={`font-medium ${selectedEvent.isFree ? 'text-emerald-600' : 'text-purple-600'}`}>
                {selectedEvent.isFree ? t('free') : `₪${selectedEvent.price}`}
              </div>
            </div>

            {selectedEvent.registrationRequired && (
              <div className="flex items-center gap-4">
                <Users className="w-6 h-6 text-purple-500" />
                <div>
                  <div className="font-medium">
                    {selectedEvent.totalRegistrations} / {selectedEvent.capacity} {t('registered')}
                  </div>
                  <div className="w-64 mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-linear-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                      style={{ width: `${(selectedEvent.totalRegistrations / selectedEvent.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {!selectedEvent.isFree && (
              <div className="p-6 bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('totalRevenue')}</div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  ₪{selectedEvent.revenue.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {VIEW_MODES.map(({ key, label, icon: Icon }) => {
            const isActive = viewMode === key;

            return (
              <Button
                key={key}
                variant='ghost'
                onClick={() => setViewMode(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-white dark:bg-gray-700 text-purple-600 shadow'
                    : 'text-gray-600 dark:text-gray-300'
                  }`}
              >
                <Icon className="w-5 h-5" />
                {t(label)}
              </Button>
            );
          })}
        </div>


        {viewMode.startsWith('calendar-') && (
          <div className="flex items-center gap-4">
            <button onClick={goPrevious} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="font-semibold text-lg min-w-48 text-center">{monthYear}</span>
            <button onClick={goNext} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <ChevronRight className="w-6 h-6" />
            </button>
            <button
              onClick={goToday}
              className="px-5 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50"
            >
              {t('today')}
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 flex-1 overflow-y-auto max-h-[calc(100vh-600px)]">
        {viewMode === 'calendar-month' && <MonthView />}
        {viewMode === 'calendar-week' && <WeekView />}
        {viewMode === 'calendar-day' && <DayView />}
        {viewMode === 'list' && <ListView />}
        {viewMode === 'grid' && <GridView />}
      </div>

      <EventModal />
    </div>
  );
}