import { motion, AnimatePresence } from 'motion/react';
import { useRef, useEffect, useState } from 'react';
import {
  Search, MapPin, Clock, Sunrise, Sun, Sunset, Moon,
  User, Heart, Users, UserPlus, FerrisWheel, Drama,
  Footprints, PartyPopper, TrendingUp, UtensilsCrossed,
  Hotel, RotateCcw, Leaf, Check, Accessibility, ChevronDown,
  LucideIcon,
} from 'lucide-react';

interface FilterSectionProps {
  selectedFilters: string[];
  toggleFilter: (filter: string) => void;
  darkMode?: boolean;
  showWeather?: boolean;
  setShowWeather?: (value: boolean) => void;
  setDarkMode?: (value: boolean) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isOpenNow: boolean;
  setIsOpenNow: (value: boolean) => void;
  isOpenWeekend: boolean;
  setIsOpenWeekend: (value: boolean) => void;
  priceRange: number;
  setPriceRange: (value: number) => void;
  selectedTimeOfDay: string[];
  setSelectedTimeOfDay: (value: string[]) => void;
  kidFriendly: boolean;
  setKidFriendly: (value: boolean) => void;
  photoOpportunity: boolean;
  setPhotoOpportunity: (value: boolean) => void;
  experienceType: string;
  setExperienceType: (value: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (value: string[]) => void;
  nearMe: boolean;
  setNearMe: (value: boolean) => void;
  displayMode: 'products' | 'businesses' | '';
  setDisplayMode: (value: 'products' | 'businesses' | '') => void;
  groupType: string;
  setGroupType: (value: string) => void;
  filteredCount?: number;
  onFilteredCountChange?: (count: number) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (value: boolean) => void;
  isMobileFullscreen?: boolean;
  viewMode?: 'feed' | 'map';
  setViewMode?: (value: 'feed' | 'map') => void;
}

// ─── Static filter data ───────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'food',          label: 'אוכל',      Icon: UtensilsCrossed, activeClass: 'bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/30' },
  { key: 'accommodation', label: 'לינה',      Icon: Hotel,           activeClass: 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-blue-500/30' },
  { key: 'attractions',   label: 'אטרקציות',  Icon: FerrisWheel,     activeClass: 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/30' },
  { key: 'culture',       label: 'תרבות',     Icon: Drama,           activeClass: 'bg-gradient-to-br from-purple-500 to-violet-500 shadow-purple-500/30' },
  { key: 'hiking',        label: 'טיולים',    Icon: Footprints,      activeClass: 'bg-gradient-to-br from-teal-500 to-cyan-500 shadow-teal-500/30' },
  { key: 'events',        label: 'אירועים',   Icon: PartyPopper,     activeClass: 'bg-gradient-to-br from-pink-500 to-rose-500 shadow-pink-500/30' },
] as const;

const GROUP_TYPES = [
  { key: 'solo',   label: 'רק אני',       Icon: User,     activeClass: 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/30' },
  { key: 'couple', label: 'אנחנו זוג',    Icon: Heart,    activeClass: 'bg-gradient-to-br from-pink-500 to-rose-500 shadow-pink-500/30' },
  { key: 'family', label: 'כל המשפחה',   Icon: Users,    activeClass: 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/30' },
  { key: 'group',  label: 'אנחנו קבוצה', Icon: UserPlus, activeClass: 'bg-gradient-to-br from-purple-500 to-violet-500 shadow-purple-500/30' },
] as const;

const TIME_OF_DAY = [
  { key: 'sunrise', label: 'זריחה', Icon: Sunrise, activeClass: 'bg-gradient-to-r from-orange-400 to-amber-500' },
  { key: 'day',     label: 'יום',   Icon: Sun,     activeClass: 'bg-gradient-to-r from-amber-400 to-yellow-500' },
  { key: 'sunset',  label: 'שקיעה', Icon: Sunset,  activeClass: 'bg-gradient-to-r from-rose-400 to-pink-500' },
  { key: 'night',   label: 'לילה',  Icon: Moon,    activeClass: 'bg-gradient-to-r from-indigo-500 to-purple-600' },
] as const;

const DIETARY = [
  { key: 'isKosher',      label: 'כשר',     Icon: Check,         activeClass: 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-blue-500/30' },
  { key: 'isAccessible',  label: 'נגיש',    Icon: Accessibility, activeClass: 'bg-gradient-to-br from-cyan-500 to-teal-500 shadow-cyan-500/30' },
  { key: 'isVegan',       label: 'טבעוני',  Icon: Leaf,          activeClass: 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/30' },
  { key: 'isVegetarian',  label: 'צמחוני',  Icon: Leaf,          activeClass: 'bg-gradient-to-br from-lime-500 to-green-500 shadow-lime-500/30' },
] as const;

const GROUP_TYPE_LABEL_MAP: Record<string, string> = {
  couple: 'בילוי זוגי',
  family: 'טיול משפחתי',
  group:  'בילוי עם החבר׳ה',
  solo:   'טיול סולו',
};

const CATEGORY_LABEL_MAP: Record<string, string> = {
  food:          'במסעדות',
  accommodation: 'בלינה',
  attractions:   'באטרקציות',
  culture:       'בתרבות',
  hiking:        'בטיולים',
  events:        'באירועים',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function FilterSection({
  selectedFilters,
  toggleFilter,
  darkMode,
  searchQuery,
  setSearchQuery,
  isOpenNow,
  setIsOpenNow,
  isOpenWeekend,
  setIsOpenWeekend,
  priceRange,
  setPriceRange,
  selectedTimeOfDay,
  setSelectedTimeOfDay,
  kidFriendly,
  setKidFriendly,
  photoOpportunity,
  setPhotoOpportunity,
  experienceType,
  setExperienceType,
  selectedCategories,
  setSelectedCategories,
  nearMe,
  setNearMe,
  displayMode,
  setDisplayMode,
  groupType,
  setGroupType,
  showFavoritesOnly,
  setShowFavoritesOnly,
  isMobileFullscreen,
}: FilterSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] = useState(false);

  const [dietary, setDietary] = useState({
    isKosher: false,
    isAccessible: false,
    isVegan: false,
    isVegetarian: false,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, []);

  const toggleTimeOfDay = (time: string) =>
    setSelectedTimeOfDay(
      selectedTimeOfDay.includes(time)
        ? selectedTimeOfDay.filter((t) => t !== time)
        : [...selectedTimeOfDay, time],
    );

  const toggleCategory = (category: string) =>
    setSelectedCategories(
      selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories, category],
    );

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedTimeOfDay([]);
    setIsOpenNow(false);
    setIsOpenWeekend(false);
    setPriceRange(500);
    setExperienceType('');
    setNearMe(false);
    setGroupType('');
    setDisplayMode('');
    setKidFriendly(false);
    setPhotoOpportunity(false);
    setShowFavoritesOnly(false);
    setDietary({ isKosher: false, isAccessible: false, isVegan: false, isVegetarian: false });
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategories.length > 0 ||
    selectedTimeOfDay.length > 0 ||
    isOpenNow || isOpenWeekend ||
    priceRange !== 500 ||
    experienceType !== '' ||
    nearMe ||
    groupType !== '' ||
    displayMode !== '' ||
    kidFriendly || photoOpportunity || showFavoritesOnly ||
    Object.values(dietary).some(Boolean);

  const generateDynamicText = () => {
    const parts: string[] = [];
    if (groupType) parts.push(GROUP_TYPE_LABEL_MAP[groupType]);
    if (selectedCategories.length === 1) parts.push(CATEGORY_LABEL_MAP[selectedCategories[0]]);
    if (isOpenNow) parts.push('פתוח עכשיו');
    else if (isOpenWeekend) parts.push('פתוח בסופ"ש');
    if (nearMe) parts.push('קרוב אלי');
    return parts.length > 0
      ? parts.join(' • ')
      : groupType === 'solo' ? 'מה מעניין אותך?' : 'מה מעניין אותכם?';
  };

  const inactiveClass = darkMode
    ? 'bg-slate-800 text-gray-300 hover:bg-slate-700'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200';

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Fixed Header */}
      <div className={`px-4 sm:px-6 md:px-8 pt-4 sm:pt-5 md:pt-6 pb-4 sm:pb-5 md:pb-6 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2
            className={`text-lg sm:text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}
            style={{ fontFamily: 'Ploni, Rubik, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            {generateDynamicText()}
          </h2>
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearAllFilters}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm font-medium cursor-pointer ${
                  darkMode
                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                    : 'bg-teal-500 hover:bg-teal-600 text-white shadow-md'
                }`}
                title="נקה הכל"
              >
                <RotateCcw className="w-4 h-4" />
                <span>נקה</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Search Box */}
        <div className="relative">
          <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10 pointer-events-none ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder={
              displayMode === 'businesses' ? 'חיפוש בית עסק...' :
              displayMode === 'products'   ? 'חיפוש חוויה...'   : 'חיפוש...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pr-12 pl-16 py-3 rounded-2xl transition-all relative z-0 text-base focus:outline-none focus:ring-4 focus:ring-teal-500/10 backdrop-blur-sm ${
              darkMode
                ? 'bg-slate-800/50 text-white placeholder-gray-400 border-2 border-slate-700/50 focus:border-teal-400/80 focus:bg-slate-800/70'
                : 'bg-white/50 text-gray-900 placeholder-gray-400 border-2 border-gray-200/50 focus:border-teal-400/80 focus:bg-white/70'
            }`}
          />
          <motion.button
            whileTap={searchQuery.trim() ? { scale: 0.95 } : {}}
            disabled={!searchQuery.trim()}
            className={`absolute left-[5px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl font-medium text-sm transition-all z-10 flex items-center justify-center ${
              searchQuery.trim()
                ? 'bg-gradient-to-l from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 cursor-pointer'
                : darkMode
                  ? 'bg-slate-800 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-600 cursor-not-allowed'
            }`}
          >
            <Search className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Scrollable Filters */}
      <div
        ref={scrollRef}
        className={`px-4 sm:px-6 md:px-8 pt-6 sm:pt-7 md:pt-8 ${isMobileFullscreen ? 'pb-32' : 'pb-64'} flex-1 overflow-y-auto scrollbar-hide`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Categories */}
        <FilterSection.Group label={groupType === 'solo' ? 'מה מעניין אותך?' : 'מה מעניין אותכם?'} darkMode={darkMode}>
          {CATEGORIES.map(({ key, label, Icon, activeClass }) => (
            <FilterBtn
              key={key}
              active={selectedCategories.includes(key)}
              activeClass={activeClass}
              inactiveClass={inactiveClass}
              onClick={() => toggleCategory(key)}
            >
              <Icon className="w-4 h-4" />
              {label}
            </FilterBtn>
          ))}
        </FilterSection.Group>

        {/* Advanced Search Toggle */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAdvancedSearchExpanded((v) => !v)}
          className={`mb-8 px-4 py-2.5 rounded-lg transition-all flex items-center gap-3 text-sm font-medium mr-auto ${
            darkMode
              ? 'bg-slate-800/80 text-teal-400 hover:bg-slate-700/80 border-2 border-slate-700'
              : 'bg-white text-teal-600 hover:bg-gray-50 border-2 border-gray-200 shadow-sm'
          }`}
        >
          <span>חיפוש מתקדם</span>
          <motion.div animate={{ rotate: isAdvancedSearchExpanded ? 180 : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.button>

        {/* Collapsible Advanced Filters */}
        <AnimatePresence>
          {isAdvancedSearchExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              {/* Results Order */}
              <FilterSection.Group label="באיזה סדר תרצו להציג את התוצאות?" darkMode={darkMode}>
                <FilterBtn
                  active={experienceType === 'popular'}
                  activeClass="bg-gradient-to-br from-teal-500 to-teal-600 shadow-teal-500/30"
                  inactiveClass={inactiveClass}
                  onClick={() => setExperienceType(experienceType === 'popular' ? '' : 'popular')}
                >
                  <TrendingUp className="w-4 h-4" />
                  שיהיה פופולרי
                </FilterBtn>
                <FilterBtn
                  active={nearMe}
                  activeClass="bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/30"
                  inactiveClass={inactiveClass}
                  onClick={() => setNearMe(!nearMe)}
                >
                  <MapPin className="w-4 h-4" />
                  קרוב אלי
                </FilterBtn>
              </FilterSection.Group>

              {/* When */}
              <FilterSection.Group label="מתי?" darkMode={darkMode}>
                <FilterBtn
                  active={!isOpenNow && !isOpenWeekend}
                  activeClass="bg-gradient-to-br from-gray-500 to-gray-600 shadow-gray-500/30"
                  inactiveClass={inactiveClass}
                  onClick={() => { setIsOpenNow(false); setIsOpenWeekend(false); }}
                >
                  <Clock className="w-4 h-4" />
                  לא משנה
                </FilterBtn>
                <FilterBtn
                  active={isOpenNow}
                  activeClass="bg-teal-500"
                  inactiveClass={inactiveClass}
                  onClick={() => setIsOpenNow(!isOpenNow)}
                >
                  עכשיו
                </FilterBtn>
                <FilterBtn
                  active={isOpenWeekend}
                  activeClass="bg-teal-500"
                  inactiveClass={inactiveClass}
                  onClick={() => setIsOpenWeekend(!isOpenWeekend)}
                >
                  בסופ"ש
                </FilterBtn>
              </FilterSection.Group>

              {/* Dietary */}
              <FilterSection.Group label="מה חשוב לכם?" darkMode={darkMode}>
                {DIETARY.map(({ key, label, Icon, activeClass }) => (
                  <FilterBtn
                    key={key}
                    active={dietary[key as keyof typeof dietary]}
                    activeClass={activeClass}
                    inactiveClass={inactiveClass}
                    onClick={() => setDietary((prev) => ({ ...prev, [key]: !prev[key as keyof typeof dietary] }))}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </FilterBtn>
                ))}
              </FilterSection.Group>

              {/* Who's coming */}
              <FilterSection.Group label="מי מגיע?" darkMode={darkMode}>
                {GROUP_TYPES.map(({ key, label, Icon, activeClass }) => (
                  <FilterBtn
                    key={key}
                    active={groupType === key}
                    activeClass={activeClass}
                    inactiveClass={inactiveClass}
                    onClick={() => setGroupType(groupType === key ? '' : key)}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </FilterBtn>
                ))}
              </FilterSection.Group>

              {/* Time of day */}
              <FilterSection.Group label="זמן ספציפי?" darkMode={darkMode}>
                {TIME_OF_DAY.map(({ key, label, Icon, activeClass }) => (
                  <FilterBtn
                    key={key}
                    active={selectedTimeOfDay.includes(key)}
                    activeClass={activeClass}
                    inactiveClass={inactiveClass}
                    onClick={() => toggleTimeOfDay(key)}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </FilterBtn>
                ))}
              </FilterSection.Group>

              {/* Display mode */}
              <div className="mb-8">
                <h3 className={`text-base font-semibold mb-3 text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>מה להציג?</h3>
                <div className={`flex gap-1 rounded-xl p-0.5 w-fit ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                  {(['', 'businesses', 'products'] as const).map((mode) => (
                    <motion.button
                      key={mode}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDisplayMode(mode)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        displayMode === mode
                          ? darkMode ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'
                          : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {mode === '' ? 'הכל' : mode === 'businesses' ? 'עסקים' : 'מוצרים'}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Reusable sub-components ──────────────────────────────────────────────────

FilterSection.Group = function Group({
  label,
  darkMode,
  children,
}: {
  label: string;
  darkMode?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h3 className={`text-base font-semibold mb-3 text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {label}
      </h3>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
};

const FilterBtn: React.FC<{
  active: boolean;
  activeClass: string;
  inactiveClass: string;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, activeClass, inactiveClass, onClick, children }) => (
  <motion.button
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
      active ? `${activeClass} text-white shadow-lg` : inactiveClass
    }`}
  >
    {children}
  </motion.button>
);
