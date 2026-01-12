
const QuickSnapEventDetails = () => {
  return (
    <div> {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedEvent(null);
          }}
        >
          <div
            className={`w-full max-w-6xl my-8 rounded-xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className={`text-2xl ${textPrimary}`}>{selectedEvent.name}</h2>
                    {selectedEvent.isMultiDay && (
                      <span className="px-3 py-1 bg-teal-500/20 text-teal-500 rounded-full text-xs flex items-center gap-1">
                        <CalendarRange className="w-3 h-3" />
                        {t.multiDayEvent}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className={`flex items-center gap-1 ${textSecondary}`}>
                      <MapPin className="w-4 h-4" />
                      {selectedEvent.location}
                    </span>
                    <span className={`flex items-center gap-1 ${textSecondary}`}>
                      <Calendar className="w-4 h-4" />
                      {formatDateRange(selectedEvent.startDate, selectedEvent.endDate, selectedEvent.isMultiDay)}
                    </span>
                    <span className={`flex items-center gap-1 ${textSecondary}`}>
                      <Clock className="w-4 h-4" />
                      {selectedEvent.startTime} - {selectedEvent.endTime}
                    </span>
                    <span className={`flex items-center gap-1 ${textSecondary}`}>
                      <DollarSign className="w-4 h-4" />
                      {selectedEvent.isFree ? t.free : `₪${selectedEvent.price}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEventToEdit(selectedEvent);
                      setIsEditWizardOpen(true);
                      setSelectedEvent(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="font-medium text-sm">Edit</span>
                  </button>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}
                  >
                    <X className={`w-6 h-6 ${textTertiary}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Snapshot Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg ${textPrimary}`}>{t.eventMetrics}</h3>
                  {selectedEvent.isMultiDay && (
                    <button
                      onClick={() => setShowDailyBreakdown(!showDailyBreakdown)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${theme === 'dark'
                          ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                    >
                      {showDailyBreakdown ? t.showSummary : t.showDailyBreakdown}
                    </button>
                  )}
                </div>

                {!showDailyBreakdown ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                      <div className={`text-xs mb-1 ${textTertiary}`}>{t.totalRegistrations}</div>
                      <div className={`text-2xl ${textPrimary}`}>{selectedEvent.totalRegistrations}</div>
                    </div>
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                      <div className={`text-xs mb-1 ${textTertiary}`}>{t.capacity}</div>
                      <div className={`text-2xl ${textPrimary}`}>{selectedEvent.capacity}</div>
                      <div className="text-xs text-teal-500 mt-1">
                        {Math.round((selectedEvent.totalRegistrations / selectedEvent.capacity) * 100)}% {t.filled}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                      <div className={`text-xs mb-1 ${textTertiary}`}>{t.revenue}</div>
                      <div className={`text-2xl ${textPrimary}`}>₪{(selectedEvent.revenue / 1000).toFixed(1)}K</div>
                    </div>
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                      <div className={`text-xs mb-1 ${textTertiary}`}>{t.refunds}</div>
                      <div className={`text-2xl ${textPrimary}`}>₪{(selectedEvent.refunds / 1000).toFixed(1)}K</div>
                    </div>
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                      <div className={`text-xs mb-1 ${textTertiary}`}>{t.eventType}</div>
                      <div className={`text-lg ${textPrimary}`}>
                        {selectedEvent.isFree ? t.free : t.paid}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <h4 className={`text-sm mb-3 ${textSecondary}`}>{t.dailyBreakdown}</h4>
                    <div className="space-y-3">
                      {selectedEvent.dailyMetrics?.map((day, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm ${textPrimary}`}>
                              {new Date(day.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <div className={`text-xs ${textTertiary}`}>{t.registrations}</div>
                              <div className={`text-lg ${textPrimary}`}>{day.registrations}</div>
                            </div>
                            <div>
                              <div className={`text-xs ${textTertiary}`}>{t.attendance}</div>
                              <div className={`text-lg ${textPrimary}`}>{day.attendance}</div>
                            </div>
                            <div>
                              <div className={`text-xs ${textTertiary}`}>{t.revenue}</div>
                              <div className={`text-lg ${textPrimary}`}>₪{(day.revenue / 1000).toFixed(1)}K</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Registration Trend Chart */}
                {selectedEvent.dailyMetrics && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                    <h4 className={`text-sm mb-3 ${textSecondary}`}>{t.registrationAttendanceTrend}</h4>
                    <div style={{ height: '200px' }}>
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <LineChart data={selectedEvent.dailyMetrics}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                          <XAxis
                            dataKey="date"
                            stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          />
                          <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                              border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                              borderRadius: '8px'
                            }}
                          />
                          <Line type="monotone" dataKey="registrations" stroke="#14b8a6" strokeWidth={2} name={t.registrations} />
                          <Line type="monotone" dataKey="attendance" stroke="#8b5cf6" strokeWidth={2} name={t.attendance} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Registrants Table */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg ${textPrimary}`}>
                    {t.registrants} ({filteredRegistrants.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportToCSV}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${theme === 'dark'
                          ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                    >
                      <FileDown className="w-4 h-4" />
                      <span className="hidden sm:inline">{t.exportCSV}</span>
                    </button>
                  </div>
                </div>

                {/* Registrant Search */}
                <div className="mb-4 relative">
                  <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-4 h-4 ${textTertiary}`} />
                  <input
                    type="text"
                    placeholder={t.searchRegistrantsPlaceholder}
                    value={registrantSearchQuery}
                    onChange={(e) => setRegistrantSearchQuery(e.target.value)}
                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 rounded-lg border text-sm ${theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                  />
                </div>

                {filteredRegistrants.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className={`w-12 h-12 mx-auto mb-3 ${textTertiary}`} />
                    <p className={textTertiary}>
                      {registrantSearchQuery ? t.noRegistrantsMatch : t.noRegistrantsYet}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <th
                            className={`text-${isRTL ? 'right' : 'left'} py-3 px-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${textTertiary}`}
                            onClick={() => handleSort('fullName')}
                          >
                            <div className="flex items-center gap-1">
                              {t.fullName}
                              <ArrowUpDown className="w-3 h-3" />
                            </div>
                          </th>
                          <th className={`text-${isRTL ? 'right' : 'left'} py-3 px-4 ${textTertiary} hidden md:table-cell`}>{t.phone}</th>
                          <th className={`text-${isRTL ? 'right' : 'left'} py-3 px-4 ${textTertiary} hidden lg:table-cell`}>{t.email}</th>
                          <th className={`text-${isRTL ? 'left' : 'right'} py-3 px-4 ${textTertiary}`}>{t.quantity}</th>
                          <th className={`text-${isRTL ? 'right' : 'left'} py-3 px-4 ${textTertiary} hidden xl:table-cell`}>{t.ticketType}</th>
                          <th
                            className={`text-${isRTL ? 'left' : 'right'} py-3 px-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${textTertiary}`}
                            onClick={() => handleSort('totalPrice')}
                          >
                            <div className="flex items-center justify-end gap-1">
                              {t.total}
                              <ArrowUpDown className="w-3 h-3" />
                            </div>
                          </th>
                          <th className={`text-center py-3 px-4 ${textTertiary}`}>{t.status}</th>
                          <th className={`text-${isRTL ? 'right' : 'left'} py-3 px-4 ${textTertiary} hidden lg:table-cell`}>{t.regDate}</th>
                          {selectedEvent.isMultiDay && (
                            <th className={`text-${isRTL ? 'right' : 'left'} py-3 px-4 ${textTertiary} hidden xl:table-cell`}>{t.days}</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRegistrants.map((reg) => (
                          <tr
                            key={reg.id}
                            onClick={() => setSelectedRegistrant(reg)}
                            className={`border-b transition-colors cursor-pointer ${theme === 'dark'
                                ? 'border-gray-800 hover:bg-gray-800/50'
                                : 'border-gray-100 hover:bg-gray-50'
                              }`}
                          >
                            <td className={`py-3 px-4 ${textPrimary}`}>{reg.fullName}</td>
                            <td className={`py-3 px-4 ${textSecondary} hidden md:table-cell`}>{reg.phone}</td>
                            <td className={`py-3 px-4 ${textSecondary} hidden lg:table-cell`}>{reg.email}</td>
                            <td className={`py-3 px-4 text-${isRTL ? 'left' : 'right'} ${textPrimary}`}>{reg.quantity}</td>
                            <td className={`py-3 px-4 ${textSecondary} hidden xl:table-cell`}>{reg.ticketType}</td>
                            <td className={`py-3 px-4 text-${isRTL ? 'left' : 'right'} ${textPrimary}`}>₪{reg.totalPrice}</td>
                            <td className={`py-3 px-4 text-center`}>
                              <span className={`px-2 py-1 rounded-full text-xs ${reg.paymentStatus === 'paid'
                                  ? 'bg-green-500/20 text-green-500'
                                  : reg.paymentStatus === 'pending'
                                    ? 'bg-yellow-500/20 text-yellow-500'
                                    : 'bg-red-500/20 text-red-500'
                                }`}>
                                {reg.paymentStatus === 'paid' ? t.paidStatus : reg.paymentStatus === 'pending' ? t.pendingStatus : t.refundedStatus}
                              </span>
                            </td>
                            <td className={`py-3 px-4 ${textSecondary} hidden lg:table-cell`}>
                              {new Date(reg.registrationDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            {selectedEvent.isMultiDay && reg.attendingDays && (
                              <td className={`py-3 px-4 ${textSecondary} hidden xl:table-cell`}>
                                {reg.attendingDays.length} {t.days}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registrant Detail Modal (Nested) */}
      {selectedRegistrant && (
        <div
          className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedRegistrant(null);
          }}
        >
          <div
            className={`w-full max-w-2xl rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h3 className={`text-xl ${textPrimary}`}>{t.registrantDetails}</h3>
              <button
                onClick={() => setSelectedRegistrant(null)}
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
              >
                <X className={`w-5 h-5 ${textTertiary}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`text-xs ${textTertiary}`}>{t.fullName}</label>
                <p className={`text-sm ${textPrimary}`}>{selectedRegistrant.fullName}</p>
              </div>
              <div>
                <label className={`text-xs ${textTertiary}`}>{t.phone}</label>
                <p className={`text-sm ${textPrimary}`}>{selectedRegistrant.phone}</p>
              </div>
              <div className="md:col-span-2">
                <label className={`text-xs ${textTertiary}`}>{t.email}</label>
                <p className={`text-sm ${textPrimary}`}>{selectedRegistrant.email}</p>
              </div>
              <div>
                <label className={`text-xs ${textTertiary}`}>{t.quantity}</label>
                <p className={`text-sm ${textPrimary}`}>{selectedRegistrant.quantity} {t.tickets}</p>
              </div>
              <div>
                <label className={`text-xs ${textTertiary}`}>{t.ticketType}</label>
                <p className={`text-sm ${textPrimary}`}>{selectedRegistrant.ticketType}</p>
              </div>
              <div>
                <label className={`text-xs ${textTertiary}`}>{t.total} {t.price}</label>
                <p className={`text-sm ${textPrimary}`}>₪{selectedRegistrant.totalPrice}</p>
              </div>
              <div>
                <label className={`text-xs ${textTertiary}`}>{t.paymentStatus}</label>
                <p className={`text-sm capitalize ${textPrimary}`}>
                  {selectedRegistrant.paymentStatus === 'paid' ? t.paidStatus : selectedRegistrant.paymentStatus === 'pending' ? t.pendingStatus : t.refundedStatus}
                </p>
              </div>
              <div>
                <label className={`text-xs ${textTertiary}`}>{t.regDate}</label>
                <p className={`text-sm ${textPrimary}`}>
                  {new Date(selectedRegistrant.registrationDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <label className={`text-xs ${textTertiary}`}>{t.sourceWebsite}</label>
                <p className={`text-sm ${textPrimary}`}>{selectedRegistrant.sourceWebsite}</p>
              </div>
              {selectedRegistrant.attendingDays && (
                <div className="md:col-span-2">
                  <label className={`text-xs ${textTertiary}`}>{t.attendingDays}</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedRegistrant.attendingDays.map((day, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-teal-500/20 text-teal-500 rounded text-xs"
                      >
                        {new Date(day).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}</div>
  )
}

export default QuickSnapEventDetails