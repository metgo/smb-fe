import clsx from 'clsx';
import { Activity, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, Ticket, DollarSign, Search, } from 'lucide-react';

import { useAppSelector } from '@/hooks/hooks';
import { FilterButton } from '@/components/btns';
import { useThemeClasses } from '@/hooks/useThemeClasses';
import { useGetAllWebsitesQuery } from '@/store/api/masterDataApi';
import { PageHeader, PageStats, ViewModeToggle } from '@/components/shared';
import { useGetAllEventsQuery, useGetEventsStatsQuery } from '@/store/api/eventQueryApi';
import { EventsWithViewMode, CreateEventWizard, EventDetailModal, QuickSnapEventDetails, RegistrantDetailModal } from './components';

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;


export default function EventsMgmtPage() {
  const { t } = useTranslation('events');
  const { isRTL, theme } = useAppSelector((state) => state.settings);
  const themeColor = useThemeClasses();


  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);

  const [editId, setEditId] = useState<string | null>(null)

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWebsites, setSelectedWebsites] = useState<Website[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [registrationFilter, setRegistrationFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past' | 'canceled'>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' });

  // Data Fetch
  const { data: events, isLoading } = useGetAllEventsQuery({
    search: searchQuery,
    // eventType: eventTypeFilter.toUpperCase()
  })
  const { data: eventStatsData, isLoading: isEventStatsFetching } = useGetEventsStatsQuery({})
  const { data: websites } = useGetAllWebsitesQuery();

  // Table and Modal State
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedRegistrant, setSelectedRegistrant] = useState<Registrant | null>(null);
  const [registrantSortConfig] = useState<SortConfig>(null);
  const [registrantSearchQuery, setRegistrantSearchQuery] = useState('');
  const [showDailyBreakdown, setShowDailyBreakdown] = useState(false);
  const [showQuickSnapModal, setShowQuickSnapModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'calendar'>('list');

  // Mock data - Registrants
  const mockRegistrants: Registrant[] = selectedEvent ? [
    {
      id: '1',
      fullName: 'David Cohen',
      phone: '+972-50-123-4567',
      email: 'david.cohen@example.com',
      quantity: 2,
      ticketType: 'General Admission',
      totalPrice: selectedEvent.price * 2,
      paymentStatus: 'paid',
      registrationDate: '2025-01-05',
      sourceWebsite: selectedEvent.website,
      attendingDays: selectedEvent.isMultiDay ? ['2025-01-18', '2025-01-19'] : undefined
    },
    {
      id: '2',
      fullName: 'Sarah Levi',
      phone: '+972-52-987-6543',
      email: 'sarah.levi@example.com',
      quantity: 1,
      ticketType: 'VIP',
      totalPrice: selectedEvent.price * 1.5,
      paymentStatus: 'paid',
      registrationDate: '2025-01-08',
      sourceWebsite: selectedEvent.website,
      attendingDays: selectedEvent.isMultiDay ? ['2025-01-18', '2025-01-19', '2025-01-20'] : undefined
    },
    {
      id: '3',
      fullName: 'Michael Peretz',
      phone: '+972-54-555-8888',
      email: 'michael.p@example.com',
      quantity: 4,
      ticketType: 'General Admission',
      totalPrice: selectedEvent.price * 4,
      paymentStatus: 'pending',
      registrationDate: '2025-01-10',
      sourceWebsite: selectedEvent.website,
      attendingDays: selectedEvent.isMultiDay ? ['2025-01-19'] : undefined
    },
    {
      id: '4',
      fullName: 'Rachel Mizrahi',
      phone: '+972-50-222-3333',
      email: 'rachel.m@example.com',
      quantity: 1,
      ticketType: 'General Admission',
      totalPrice: selectedEvent.price,
      paymentStatus: 'refunded',
      registrationDate: '2025-01-03',
      sourceWebsite: selectedEvent.website,
      attendingDays: selectedEvent.isMultiDay ? ['2025-01-18'] : undefined
    },
    {
      id: '5',
      fullName: 'Yossi Alon',
      phone: '+972-53-777-9999',
      email: 'yossi.alon@example.com',
      quantity: 2,
      ticketType: 'Early Bird',
      totalPrice: selectedEvent.price * 2 * 0.8,
      paymentStatus: 'paid',
      registrationDate: '2024-12-28',
      sourceWebsite: selectedEvent.website,
      attendingDays: selectedEvent.isMultiDay ? ['2025-01-18', '2025-01-19', '2025-01-20'] : undefined
    },
  ] : [];


  // Sort registrants
  const sortedRegistrants = [...mockRegistrants].sort((a, b) => {
    if (!registrantSortConfig) return 0;
    const { key, direction } = registrantSortConfig;

    const aRaw = a[key as keyof Registrant];
    const bRaw = b[key as keyof Registrant];

    const normalize = (val: any) => {
      if (val === undefined || val === null) return '';
      if (typeof val === 'string') return val.toLowerCase();
      if (typeof val === 'number') return val;
      if (Array.isArray(val)) return val.length;
      if (val instanceof Date) return val.getTime();
      return String(val).toLowerCase();
    };

    const aVal = normalize(aRaw);
    const bVal = normalize(bRaw);

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    }

    if (String(aVal) < String(bVal)) return direction === 'asc' ? -1 : 1;
    if (String(aVal) > String(bVal)) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter registrants by search
  const filteredRegistrants = sortedRegistrants.filter(reg => {
    if (!registrantSearchQuery) return true;
    const query = registrantSearchQuery.toLowerCase();
    return (
      reg.fullName.toLowerCase().includes(query) ||
      reg.email.toLowerCase().includes(query) ||
      reg.phone.includes(query)
    );
  });


  // Handle edit event
  const handleEditEvent = () => {
    if (selectedEvent) {
      setIsCreateWizardOpen(true);
      setSelectedEvent(null);
      setEditId(selectedEvent?._id)
    }
  };

  // Handle view details
  const handleViewDetails = () => {
    setShowDailyBreakdown(true);
    setShowQuickSnapModal(false)
  };





  const eventStats = [
    {
      id: 1,
      title: t('total_events'),
      value: eventStatsData?.totalEventsCount,
      label: `${eventStatsData?.upcomingEventsCount} ${t('upcoming')}`,
      labelClass: 'text-green-500',
      icon: <Calendar className="w-8 h-8 text-teal-500" />,
    },
    {
      id: 2,
      title: t('total_registrations'),
      value: eventStatsData?.totalRegistration,
      icon: <Users className="w-8 h-8 text-blue-500" />,
    },
    {
      id: 3,
      title: t('total_revenue'),
      value: `₪${(eventStatsData?.totalRevenue / 1000).toFixed(1)}K`,
      icon: <DollarSign className="w-8 h-8 text-green-500" />,
    },
    {
      id: 4,
      title: t('avg_capacity_fill'),
      value: `${eventStatsData?.avgCapacityFill}%`,
      icon: <Ticket className="w-8 h-8 text-purple-500" />,
    },
  ];


  return (
    <>
      <div className="h-[calc(108vh-210px)] flex flex-col">
        <PageHeader
          title={t('events_management_dashboard')}
          description={t('events_management_desc')}
          btnLabel={t('add_event')}
          h1Gradient={themeColor.textPrimary}
          onClick={() => setIsCreateWizardOpen(true)}
        />

        <PageStats
          stats={eventStats}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        />

        {/* Search and Filter Section */}
        <div className={`mb-2`}>
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-2">
            <div className="flex-1 relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeColor.textTertiary}`} />
              <input
                type="text"
                placeholder={t('search_events_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 rounded-lg border transition-colors ${theme === 'dark'
                  ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
              />
            </div>
            <FilterButton value={showFilters} onChange={setShowFilters} />
            <ViewModeToggle
              showCalendor
              onChange={setViewMode}
              value={viewMode}
            />
          </div>

          {showFilters && (
            <div className={clsx(themeColor.inputClasses, "px-4 py-3 rounded-md")}>
              {/* Collapsible Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-4  dark:border-gray-700">
                {/* Website Multi-Select */}
                <div>
                  <label className={`block text-sm mb-2 ${themeColor.textSecondary}`}>{t('websites')}</label>
                  <div className={`p-3 rounded-lg border max-h-32 overflow-y-auto ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-white'
                    }`}>
                    {websites && websites?.map((website) => (
                      <label key={website?._id} className="flex items-center gap-2 mb-2 last:mb-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedWebsites.includes(website)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedWebsites([...selectedWebsites, website]);
                            } else {
                              setSelectedWebsites(selectedWebsites?.filter(w => w._id !== website._id));
                            }
                          }}
                          className="rounded text-teal-500"
                        />
                        <span className={`text-sm ${themeColor.textSecondary}`}>{website?.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Event Type */}
                <div>
                  <label className={`block text-sm mb-2 ${themeColor.textSecondary}`}>{t('event_type')}</label>
                  <select
                    value={eventTypeFilter}
                    onChange={(e) => setEventTypeFilter(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark'
                      ? 'bg-gray-900 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  >
                    <option value="all">{t('all')}</option>
                    <option value="free">{t('free')}</option>
                    <option value="paid">{t('paid')}</option>
                  </select>
                </div>

                {/* Registration Required */}
                <div>
                  <label className={`block text-sm mb-2 ${themeColor.textSecondary}`}>{t('registration')}</label>
                  <select
                    value={registrationFilter}
                    onChange={(e) => setRegistrationFilter(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark'
                      ? 'bg-gray-900 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  >
                    <option value="all">{t('all')}</option>
                    <option value="yes">{t('required')}</option>
                    <option value="no">{t('not_required')}</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className={`block text-sm mb-2 ${themeColor.textSecondary}`}>{t('status')}</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark'
                      ? 'bg-gray-900 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  >
                    <option value="all">{t('all')}</option>
                    <option value="upcoming">{t('upcoming_status')}</option>
                    <option value="past">{t('past_status')}</option>
                    <option value="canceled">{t('canceled_status')}</option>
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className={`block text-sm mb-2 ${themeColor.textSecondary}`}>{t('date_range')}</label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="date"
                      value={dateRangeFilter.start}
                      onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, start: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${theme === 'dark'
                        ? 'bg-gray-900 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        }`}
                    />
                    <input
                      type="date"
                      value={dateRangeFilter.end}
                      onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, end: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${theme === 'dark'
                        ? 'bg-gray-900 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        }`}
                    />
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              {(selectedWebsites.length > 0 || eventTypeFilter !== 'all' || registrationFilter !== 'all' ||
                statusFilter !== 'all' || dateRangeFilter.start || dateRangeFilter.end || searchQuery) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-wrap">
                    <span className={`text-sm ${themeColor.textTertiary}`}>{t('active_filters')}:</span>
                    {searchQuery && (
                      <span className="px-3 py-1 bg-teal-500/20 text-teal-500 rounded-full text-xs">
                        {t('search')}: "{searchQuery}"
                      </span>
                    )}
                    {selectedWebsites.map(w => (
                      <span key={w._id} className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full text-xs">
                        {w.name}
                      </span>
                    ))}
                    {eventTypeFilter !== 'all' && (
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-500 rounded-full text-xs">
                        {eventTypeFilter === 'free' ? t('free_events') : t('paid_events')}
                      </span>
                    )}
                    {registrationFilter !== 'all' && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">
                        {registrationFilter === 'yes' ? t('registration_required_text') : t('registration_not_required')}
                      </span>
                    )}
                    {statusFilter !== 'all' && (
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs capitalize">
                        {statusFilter === 'upcoming' ? t('upcoming_status') : statusFilter === 'past' ? t('past_status') : t('canceled_status')}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedWebsites([]);
                        setEventTypeFilter('all');
                        setRegistrationFilter('all');
                        setStatusFilter('all');
                        setDateRangeFilter({ start: '', end: '' });
                      }}
                      className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors"
                    >
                      {t('clear_all')}
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Events with different View */}
        <EventsWithViewMode
          events={events as any || []}
          selectedWebsiteCount={selectedWebsites?.length || 0}
          eventTypeFilter={eventTypeFilter}
          registrationFilter={registrationFilter}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          setSelectedEvent={setSelectedEvent}
          setShowQuickSnapModal={setShowQuickSnapModal}
          viewMode={viewMode}
        />
      </div>

      {/* Event Detail Modal */}
      <Activity mode={showDailyBreakdown && !showQuickSnapModal ? "visible" : "hidden"}>
        <EventDetailModal
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          showDailyBreakdown={showDailyBreakdown}
          setShowDailyBreakdown={setShowDailyBreakdown}
          registrantSearchQuery={registrantSearchQuery}
          setRegistrantSearchQuery={setRegistrantSearchQuery}
          filteredRegistrants={filteredRegistrants}
          isRTL={isRTL}
          setSelectedRegistrant={setSelectedRegistrant}
        />
      </Activity>

      {/* Registrant Detail Modal (Nested) */}
      <Activity mode={selectedRegistrant ? "visible" : "hidden"}>
        <RegistrantDetailModal
          selectedRegistrant={selectedRegistrant}
          setSelectedRegistrant={setSelectedRegistrant}
        />
      </Activity>

      <Activity mode={selectedEvent && showQuickSnapModal ? "visible" : "hidden"}>
        <QuickSnapEventDetails
          handleEditEvent={handleEditEvent}
          handleViewDetails={handleViewDetails}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
        />
      </Activity>

      {/* Create Event Wizard */}
      <CreateEventWizard
        editId={editId}
        isOpen={isCreateWizardOpen}
        onClose={() => setIsCreateWizardOpen(false)}
        theme={theme}
        mode="create"
      />
    </>
  );
}