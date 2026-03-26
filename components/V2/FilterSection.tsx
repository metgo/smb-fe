import { motion, AnimatePresence } from "motion/react";
import { useRef, useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  User,
  Heart,
  Users,
  UserPlus,
  Camera,
  ShoppingCart,
  Store,
  Utensils,
  Coffee,
  FerrisWheel,
  Drama,
  Footprints,
  PartyPopper,
  Home,
  ThermometerSun,
  TrendingUp,
  UtensilsCrossed,
  Hotel,
  RotateCcw,
  Leaf,
  Check,
  Accessibility,
  Map,
  List,
  ChevronDown,
} from "lucide-react";

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
  displayMode: "products" | "businesses" | "";
  setDisplayMode: (value: "products" | "businesses" | "") => void;
  groupType: string;
  setGroupType: (value: string) => void;
  filteredCount?: number;
  onFilteredCountChange?: (count: number) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (value: boolean) => void;
  isMobileFullscreen?: boolean;
  viewMode?: "feed" | "map";
  setViewMode?: (value: "feed" | "map") => void;
}

export function FilterSection({
  selectedFilters,
  toggleFilter,
  darkMode,
  showWeather,
  setShowWeather,
  setDarkMode,
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
  filteredCount,
  onFilteredCountChange,
  showFavoritesOnly,
  setShowFavoritesOnly,
  isMobileFullscreen,
  viewMode,
  setViewMode,
}: FilterSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // New state for dietary preferences
  const [isKosher, setIsKosher] = useState(false);
  const [isAccessible, setIsAccessible] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isVegetarian, setIsVegetarian] = useState(false);

  // State for advanced search collapse
  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] =
    useState(false);

  // Scroll to top when component mounts (filter panel opens)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, []);

  const toggleTimeOfDay = (time: string) => {
    setSelectedTimeOfDay(
      selectedTimeOfDay.includes(time)
        ? selectedTimeOfDay.filter((t) => t !== time)
        : [...selectedTimeOfDay, time],
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(
      selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories, category],
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedTimeOfDay([]);
    setIsOpenNow(false);
    setIsOpenWeekend(false);
    setPriceRange(500);
    setExperienceType("");
    setNearMe(false);
    setGroupType("");
    setDisplayMode("");
    setKidFriendly(false);
    setPhotoOpportunity(false);
    setShowFavoritesOnly(false);
    setIsKosher(false);
    setIsAccessible(false);
    setIsVegan(false);
    setIsVegetarian(false);
  };

  // Check if there are any active filters
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategories.length > 0 ||
    selectedTimeOfDay.length > 0 ||
    isOpenNow ||
    isOpenWeekend ||
    priceRange !== 500 ||
    experienceType !== "" ||
    nearMe ||
    groupType !== "" ||
    displayMode !== "" ||
    kidFriendly ||
    photoOpportunity ||
    showFavoritesOnly ||
    isKosher ||
    isAccessible ||
    isVegan ||
    isVegetarian;

  // Generate dynamic header text
  const generateDynamicText = () => {
    const parts: string[] = [];

    // Add group type prefix
    if (groupType === "couple") {
      parts.push("בילוי זוגי");
    } else if (groupType === "family") {
      parts.push("טיול משפחתי");
    } else if (groupType === "group") {
      parts.push("בילוי עם החבר׳ה");
    } else if (groupType === "solo") {
      parts.push("טיול סולו");
    }

    // Add category
    if (selectedCategories.length === 1) {
      const categoryMap: { [key: string]: string } = {
        food: "במסעדות",
        accommodation: "בלינה",
        attractions: "באטרקציות",
        culture: "בתרבות",
        hiking: "בטיולים",
        events: "באירועים",
      };
      parts.push(categoryMap[selectedCategories[0]]);
    }

    // Add time preference
    if (isOpenNow) {
      parts.push("פתוח עכשיו");
    } else if (isOpenWeekend) {
      parts.push('פתוח בסופ"ש');
    }

    // Add location preference
    if (nearMe) {
      parts.push("קרוב אלי");
    }

    // Add experience type
    if (experienceType === "popular") {
      parts.push(" попуלרי");
    }

    return parts.length > 0
      ? parts.join(" • ")
      : groupType === "solo"
        ? "מה מעניין אותך?"
        : "מה מעניין אותכם?";
  };

  return (
    <div
      className={`h-full flex flex-col ${darkMode ? "bg-slate-900" : "bg-gray-50"}`}
    >
      {/* Fixed Header */}
      <div
        className={`px-4 sm:px-6 md:px-8 pt-4 sm:pt-5 md:pt-6 pb-4 sm:pb-5 md:pb-6 border-b ${darkMode ? "border-slate-700" : "border-gray-200"}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className={`text-lg sm:text-xl md:text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            style={{
              fontFamily: "Ploni, Rubik, sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
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
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm font-medium ${
                  darkMode
                    ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                    : "bg-teal-500 hover:bg-teal-600 text-white cursor-pointer shadow-md"
                }`}
                title="נקה הכל"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">נקה</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Search Box */}
        <div className="relative">
          <Search
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10 pointer-events-none ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          />
          <input
            type="text"
            placeholder={
              displayMode === "businesses"
                ? "חיפוש בית עסק..."
                : displayMode === "products"
                  ? "חיפוש חוויה..."
                  : "חיפוש..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pr-12 pl-16 py-3 rounded-2xl transition-all relative z-0 text-base ${
              darkMode
                ? "bg-slate-800/50 text-white placeholder-gray-400 border-2 border-slate-700/50 focus:border-teal-400/80 focus:bg-slate-800/70"
                : "bg-white/50 text-gray-900 placeholder-gray-400 border-2 border-gray-200/50 focus:border-teal-400/80 focus:bg-white/70"
            } focus:outline-none focus:ring-4 focus:ring-teal-500/10 backdrop-blur-sm`}
          />
          <motion.button
            whileTap={searchQuery.trim() ? { scale: 0.95 } : {}}
            disabled={!searchQuery.trim()}
            className={`absolute left-[5px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl font-medium text-sm transition-all z-10 flex items-center justify-center ${
              searchQuery.trim()
                ? "bg-gradient-to-l from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 cursor-pointer"
                : darkMode
                  ? "bg-slate-800 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-600 cursor-not-allowed"
            }`}
          >
            <Search className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Scrollable Filters Section */}
      <div
        ref={scrollRef}
        className={`px-4 sm:px-6 md:px-8 pt-6 sm:pt-7 md:pt-8 ${
          isMobileFullscreen ? "pb-32" : "pb-64"
        } flex-1 overflow-y-auto scrollbar-hide`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* 1. What interests you - Categories */}
        <div className="mb-8">
          <h3
            className={`text-base font-semibold mb-3 text-right ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            {groupType === "solo" ? "מה מעניין אותך?" : "מה מעניין אותכם?"}
          </h3>
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => toggleCategory("food")}
              className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                selectedCategories.includes("food")
                  ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30"
                  : darkMode
                    ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              אוכל
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => toggleCategory("accommodation")}
              className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                selectedCategories.includes("accommodation")
                  ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                  : darkMode
                    ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Hotel className="w-4 h-4" />
              לינה
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => toggleCategory("attractions")}
              className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                selectedCategories.includes("attractions")
                  ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                  : darkMode
                    ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FerrisWheel className="w-4 h-4" />
              אטרקציות
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => toggleCategory("culture")}
              className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                selectedCategories.includes("culture")
                  ? "bg-gradient-to-br from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/30"
                  : darkMode
                    ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Drama className="w-4 h-4" />
              תרבות
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => toggleCategory("hiking")}
              className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                selectedCategories.includes("hiking")
                  ? "bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30"
                  : darkMode
                    ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Footprints className="w-4 h-4" />
              טיולים
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => toggleCategory("events")}
              className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                selectedCategories.includes("events")
                  ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30"
                  : darkMode
                    ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <PartyPopper className="w-4 h-4" />
              אירועים
            </motion.button>
          </div>
        </div>

        {/* Advanced Search Toggle Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAdvancedSearchExpanded(!isAdvancedSearchExpanded)}
          className={`mb-8 px-4 py-2.5 rounded-lg transition-all flex items-center gap-3 text-sm font-medium mr-auto ${
            darkMode
              ? "bg-slate-800/80 text-teal-400 hover:bg-slate-700/80 border-2 border-slate-700"
              : "bg-white text-teal-600 hover:bg-gray-50 border-2 border-gray-200 shadow-sm"
          }`}
        >
          <span>חיפוש מתקדם</span>
          <motion.div
            animate={{ rotate: isAdvancedSearchExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.button>

        {/* Collapsible Advanced Filters */}
        <AnimatePresence>
          {isAdvancedSearchExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              {/* 2. Results Order (Sorting) - FIRST OCCURRENCE */}
              <div className="mb-8">
                <h3
                  className={`text-base font-semibold mb-3 text-right ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  באיזה סדר תרצו להציג את התוצאות?
                </h3>
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() =>
                      setExperienceType(
                        experienceType === "popular" ? "" : "popular",
                      )
                    }
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                      experienceType === "popular"
                        ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    שיהיה פופולרי
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setNearMe(!nearMe)}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                      nearMe
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    קרוב אלי
                  </motion.button>
                </div>
              </div>

              {/* 3. When (Opening Times) */}
              <div className="mb-8">
                <h3
                  className={`text-base font-semibold mb-3 text-right ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  מתי?
                </h3>
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setIsOpenNow(false);
                      setIsOpenWeekend(false);
                    }}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                      !isOpenNow && !isOpenWeekend
                        ? "bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    לא משנה
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsOpenNow(!isOpenNow)}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                      isOpenNow
                        ? "bg-teal-500 text-white shadow-md"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    עכשיו
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsOpenWeekend(!isOpenWeekend)}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                      isOpenWeekend
                        ? "bg-teal-500 text-white shadow-md"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    בסופ"ש
                  </motion.button>
                </div>
              </div>

              {/* 4. What's Important (Dietary Preferences) */}
              <div className="mb-8">
                <h3
                  className={`text-base font-semibold mb-3 text-right ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  מה חשוב לכם?
                </h3>
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsKosher(!isKosher)}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                      isKosher
                        ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    כשר
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsAccessible(!isAccessible)}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                      isAccessible
                        ? "bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/30"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Accessibility className="w-4 h-4" />
                    נגיש
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsVegan(!isVegan)}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                      isVegan
                        ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Leaf className="w-4 h-4" />
                    טבעוני
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsVegetarian(!isVegetarian)}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                      isVegetarian
                        ? "bg-gradient-to-br from-lime-500 to-green-500 text-white shadow-lg shadow-lime-500/30"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Leaf className="w-4 h-4" />
                    צמחוני
                  </motion.button>
                </div>
              </div>

              {/* 5. Who's coming (Group Type) */}
              <div className="mb-8">
                <h3
                  className={`text-base font-semibold mb-3 text-right ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  מי מגיע?
                </h3>
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() =>
                      setGroupType(groupType === "solo" ? "" : "solo")
                    }
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                      groupType === "solo"
                        ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    רק אני
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() =>
                      setGroupType(groupType === "couple" ? "" : "couple")
                    }
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                      groupType === "couple"
                        ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                    אנחנו זוג
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() =>
                      setGroupType(groupType === "family" ? "" : "family")
                    }
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                      groupType === "family"
                        ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    כל המשפחה
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() =>
                      setGroupType(groupType === "group" ? "" : "group")
                    }
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                      groupType === "group"
                        ? "bg-gradient-to-br from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/30"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    אנחנו קבוצה
                  </motion.button>
                </div>
              </div>

              {/* 6. Specific Time (Time of Day) */}
              <div className="mb-8">
                <h3
                  className={`text-base font-semibold mb-3 text-right ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  זמן ספציפי?
                </h3>
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => toggleTimeOfDay("sunrise")}
                    className={`px-4 py-3 rounded-xl transition-all text-sm font-medium flex items-center gap-2 ${
                      selectedTimeOfDay.includes("sunrise")
                        ? "bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Sunrise className="w-4 h-4" />
                    זריחה
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => toggleTimeOfDay("day")}
                    className={`px-4 py-3 rounded-xl transition-all text-sm font-medium flex items-center gap-2 ${
                      selectedTimeOfDay.includes("day")
                        ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    יום
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => toggleTimeOfDay("sunset")}
                    className={`px-4 py-3 rounded-xl transition-all text-sm font-medium flex items-center gap-2 ${
                      selectedTimeOfDay.includes("sunset")
                        ? "bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Sunset className="w-4 h-4" />
                    שקיעה
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => toggleTimeOfDay("night")}
                    className={`px-4 py-3 rounded-xl transition-all text-sm font-medium flex items-center gap-2 ${
                      selectedTimeOfDay.includes("night")
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    לילה
                  </motion.button>
                </div>
              </div>

              {/* 7. What to Show (Display Mode) */}
              <div className="mb-8">
                <h3
                  className={`text-base font-semibold mb-3 text-right ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  מה להציג?
                </h3>
                <div
                  className={`flex gap-1 rounded-xl p-0.5 w-fit ${darkMode ? "bg-slate-800" : "bg-gray-100"}`}
                >
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDisplayMode("")}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      displayMode === ""
                        ? darkMode
                          ? "bg-slate-700 text-white shadow-sm"
                          : "bg-white text-gray-900 shadow-sm"
                        : darkMode
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    הכל
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDisplayMode("businesses")}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      displayMode === "businesses"
                        ? darkMode
                          ? "bg-slate-700 text-white shadow-sm"
                          : "bg-white text-gray-900 shadow-sm"
                        : darkMode
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    עסקים
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDisplayMode("products")}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      displayMode === "products"
                        ? darkMode
                          ? "bg-slate-700 text-white shadow-sm"
                          : "bg-white text-gray-900 shadow-sm"
                        : darkMode
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    מוצרים
                  </motion.button>
                </div>
              </div>

              {/* 8. Results Order (Sorting) - SECOND OCCURRENCE */}
              <div className="mb-6">
                <h3
                  className={`text-base font-semibold mb-3 text-right ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  באיזה סדר תרצו להציג את התוצאות?
                </h3>
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() =>
                      setExperienceType(
                        experienceType === "popular" ? "" : "popular",
                      )
                    }
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                      experienceType === "popular"
                        ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    שיהיה פופולרי
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setNearMe(!nearMe)}
                    className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                      nearMe
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                        : darkMode
                          ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    קרוב אלי
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
