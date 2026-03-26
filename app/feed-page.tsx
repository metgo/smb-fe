import { useState, useEffect, useRef } from "react";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { FilterSection } from "../components/FilterSection";
import { ExperienceContainer } from "../components/ExperienceContainer";
import { FloatingNotification } from "../components/FloatingNotification";
import { AnimatePresence, motion } from "motion/react";
import {
  UtensilsCrossed,
  Hotel,
  FerrisWheel,
  Drama,
  Footprints,
  PartyPopper,
} from "lucide-react";

export function HomePage() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showWeather, setShowWeather] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    // Load dark mode from localStorage
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [cartItemsCount, setCartItemsCount] = useState(() => {
    const saved = localStorage.getItem("cartItems");
    return saved ? JSON.parse(saved).length : 0;
  });
  const [categoryButtonsUsed, setCategoryButtonsUsed] = useState(false);
  const [showTitleInHeader, setShowTitleInHeader] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showCompactHeader, setShowCompactHeader] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const categoryButtonsRef = useRef<HTMLDivElement>(null);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      // Detect scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection("up");
      }
      setLastScrollY(currentScrollY);

      // Check if title is out of view
      if (titleRef.current) {
        const rect = titleRef.current.getBoundingClientRect();
        // Title is hidden when it scrolls above the viewport
        setShowTitleInHeader(rect.bottom < 0);
      }

      // Check if category buttons are out of view
      if (categoryButtonsRef.current) {
        const rect = categoryButtonsRef.current.getBoundingClientRect();
        // Show dropdown when category buttons scroll above the viewport
        setShowCategoriesDropdown(rect.bottom < 0);
      }

      // Mobile: Show compact header when scrolled down past hero
      if (isMobile) {
        setShowCompactHeader(
          currentScrollY > 200 && scrollDirection === "down",
        );
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, scrollDirection, isMobile]);

  // Listen for changes in localStorage (cart updates)
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("cartItems");
      setCartItemsCount(saved ? JSON.parse(saved).length : 0);
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener("storage", handleStorageChange);

    // Also check periodically (for same-page updates)
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Restore scroll position when returning from business page
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem("homeScrollPosition");
    if (savedScrollPosition) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedScrollPosition, 10),
          behavior: "instant",
        });
        // Clear the saved position after restoring
        sessionStorage.removeItem("homeScrollPosition");
      }, 0);
    }
  }, []);

  // Save dark mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Reset scroll position when filter opens on mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    if (isFilterOpen && isMobile) {
      // Small delay to ensure the element is rendered
      setTimeout(() => {
        const filterElement = document.querySelector("[data-mobile-filter]");
        if (filterElement) {
          filterElement.scrollTop = 0;
        }
      }, 50);
    }
  }, [isFilterOpen]);

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter],
    );
  };

  // Title appears after scrolling past 50% of hero section
  const titleOpacity = Math.min(Math.max(scrollY - 300, 0) / 200, 1);
  const titleY = Math.max(50 - scrollY / 8, 0);

  // Parallax overlay effect - content starts covering video near the end
  // When scrolled past 500px, the content section starts to overlay the video
  const overlayEffect = Math.min(Math.max((scrollY - 500) / 150, 0), 1);
  const contentOverlay = overlayEffect * -80; // Move content up to overlap video

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [isOpenWeekend, setIsOpenWeekend] = useState(false);
  const [priceRange, setPriceRange] = useState<number>(500);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string[]>([]);
  const [kidFriendly, setKidFriendly] = useState(false);
  const [photoOpportunity, setPhotoOpportunity] = useState(false);
  const [experienceType, setExperienceType] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [nearMe, setNearMe] = useState(false);
  const [displayMode, setDisplayMode] = useState<
    "products" | "businesses" | ""
  >("");
  const [groupType, setGroupType] = useState<string>(""); // solo, couple, family, group
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"feed" | "map">("feed"); // feed or map view

  // Calculate active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (isOpenNow) count++;
    if (isOpenWeekend) count++;
    if (displayMode) count++;
    if (kidFriendly) count++;
    if (photoOpportunity) count++;
    if (experienceType) count++;
    if (nearMe) count++;
    if (groupType) count++;
    if (showFavoritesOnly) count++;
    count += selectedTimeOfDay.length;
    count += selectedCategories.length;
    count += selectedFilters?.length || 0;
    return count;
  };

  // State for filtered count
  const [filteredCount, setFilteredCount] = useState(20);

  const handleFilteredCountChange = (count: number) => {
    setFilteredCount(count);
  };

  // Handle filter toggle with scroll to feed
  const handleFilterToggle = () => {
    const newState = !isFilterOpen;
    setIsFilterOpen(newState);

    // DON'T prevent body scroll when filter is open on mobile - we want to keep feed scrollable
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      // On mobile, don't lock body scroll anymore
      // This allows the feed to remain scrollable behind the half-screen filter
    }

    // If opening filter, scroll to feed (main content) on desktop only
    if (newState && !isMobile) {
      setTimeout(() => {
        const mainElement = document.querySelector("main");
        if (mainElement) {
          const offset = 100; // Small offset from top
          const elementPosition = mainElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  // Clean up body overflow when component unmounts or window resizes
  useEffect(() => {
    const handleResize = () => {
      // If we're now on desktop, make sure body overflow is not blocked
      if (window.innerWidth >= 768) {
        document.body.style.overflow = "";
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-900" : "bg-gray-50"}`}
      dir="rtl"
    >
      <Header
        darkMode={darkMode}
        showWeather={showWeather}
        cartItemsCount={cartItemsCount}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showTitle={showTitleInHeader}
        showCategoriesDropdown={showCategoriesDropdown}
        selectedCategories={selectedCategories}
        onCategoryToggle={(categoryId) => {
          setSelectedCategories(
            selectedCategories.includes(categoryId)
              ? selectedCategories.filter((c) => c !== categoryId)
              : [...selectedCategories, categoryId],
          );
        }}
        isMobile={isMobile}
        showCompactHeader={showCompactHeader}
        scrollDirection={scrollDirection}
        scrollY={scrollY}
      />
      <Hero darkMode={darkMode} />

      {/* Mobile Filter Overlay - Bottom half of screen only */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            {/* Semi-transparent backdrop for top half */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
              className="md:hidden fixed z-40 inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0%, transparent 50%, rgba(0,0,0,0.3) 50%)",
                pointerEvents: "none",
              }}
            />

            {/* Filter panel - bottom half only */}
            <motion.div
              key="mobile-filter"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="md:hidden fixed z-50 inset-x-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              data-mobile-filter
              style={{
                top: "50%", // Start from middle of screen
                bottom: 0,
                backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                borderTopLeftRadius: "24px",
                borderTopRightRadius: "24px",
                boxShadow: "0 -10px 50px rgba(0,0,0,0.3)",
                overflow: "auto",
              }}
            >
              {/* Drag handle indicator */}
              <div
                className="sticky top-0 z-10 pt-3 pb-2 flex justify-center"
                style={{ backgroundColor: darkMode ? "#0f172a" : "#ffffff" }}
              >
                <div
                  className={`w-12 h-1 rounded-full ${darkMode ? "bg-slate-700" : "bg-gray-300"}`}
                />
              </div>

              {/* Filter Content with proper padding */}
              <div className="px-4 pb-6">
                <FilterSection
                  selectedFilters={selectedFilters}
                  toggleFilter={toggleFilter}
                  darkMode={darkMode}
                  showWeather={showWeather}
                  setShowWeather={setShowWeather}
                  setDarkMode={setDarkMode}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  isOpenNow={isOpenNow}
                  setIsOpenNow={setIsOpenNow}
                  isOpenWeekend={isOpenWeekend}
                  setIsOpenWeekend={setIsOpenWeekend}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  selectedTimeOfDay={selectedTimeOfDay}
                  setSelectedTimeOfDay={setSelectedTimeOfDay}
                  kidFriendly={kidFriendly}
                  setKidFriendly={setKidFriendly}
                  photoOpportunity={photoOpportunity}
                  setPhotoOpportunity={setPhotoOpportunity}
                  experienceType={experienceType}
                  setExperienceType={setExperienceType}
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  nearMe={nearMe}
                  setNearMe={setNearMe}
                  displayMode={displayMode}
                  setDisplayMode={setDisplayMode}
                  groupType={groupType}
                  setGroupType={setGroupType}
                  filteredCount={filteredCount}
                  onFilteredCountChange={handleFilteredCountChange}
                  showFavoritesOnly={showFavoritesOnly}
                  setShowFavoritesOnly={setShowFavoritesOnly}
                  isMobileFullscreen={false}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content Section - Parallax overlay that covers the video */}
      <div
        className={`relative z-20 shadow-[0_-20px_80px_rgba(0,0,0,0.3)] transition-colors duration-300 ${
          darkMode ? "bg-slate-900" : "bg-white"
        }`}
        style={{
          transform: `translateY(${contentOverlay}px)`,
          transition: "transform 0.1s linear",
        }}
      >
        {/* Scrolling Title */}
        <div
          className="pt-24 pb-12 px-4 sm:px-6 lg:px-8"
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          <div className="max-w-7xl mx-auto">
            <h1
              ref={titleRef}
              className={`text-center ${darkMode ? "text-white" : "text-gray-900"}`}
              style={{
                fontFamily: "Ploni, Rubik, sans-serif",
                fontWeight: 300,
                fontSize: "clamp(3.5rem, 12vw, 9rem)",
                letterSpacing: "-0.02em",
                lineHeight: 0.85,
              }}
            >
              לוקחים נשימה
            </h1>

            {/* Subtitle - "עם הנגב הפורח" */}
            <p
              className="text-center bg-gradient-to-l from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent"
              style={{
                fontFamily: "Ploni, Rubik, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(4.5rem, 15vw, 11.5rem)",
                letterSpacing: "-0.02em",
                lineHeight: 0.85,
                backgroundSize: "300% 100%",
                animation: "elegantFlow 8s ease-in-out infinite",
                textShadow: darkMode
                  ? "0 0 40px rgba(94, 234, 212, 0.15)"
                  : "0 0 30px rgba(94, 234, 212, 0.1)",
              }}
            >
              עם הנגב הפורח
            </p>

            {/* Category Buttons - Always visible with active state colors */}
            <motion.div
              className="flex flex-wrap gap-3 justify-center mt-12"
              ref={categoryButtonsRef}
            >
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedCategories(
                    selectedCategories.includes("food")
                      ? selectedCategories.filter((c) => c !== "food")
                      : [...selectedCategories, "food"],
                  );
                }}
                className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium backdrop-blur-sm ${
                  selectedCategories.includes("food")
                    ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30"
                    : darkMode
                      ? "bg-slate-800/80 text-gray-300 hover:bg-slate-700"
                      : "bg-white/80 text-gray-700 hover:bg-white shadow-md"
                }`}
              >
                <UtensilsCrossed className="w-5 h-5" />
                אוכל
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedCategories(
                    selectedCategories.includes("accommodation")
                      ? selectedCategories.filter((c) => c !== "accommodation")
                      : [...selectedCategories, "accommodation"],
                  );
                }}
                className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium backdrop-blur-sm ${
                  selectedCategories.includes("accommodation")
                    ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                    : darkMode
                      ? "bg-slate-800/80 text-gray-300 hover:bg-slate-700"
                      : "bg-white/80 text-gray-700 hover:bg-white shadow-md"
                }`}
              >
                <Hotel className="w-5 h-5" />
                לינה
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedCategories(
                    selectedCategories.includes("attractions")
                      ? selectedCategories.filter((c) => c !== "attractions")
                      : [...selectedCategories, "attractions"],
                  );
                }}
                className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium backdrop-blur-sm ${
                  selectedCategories.includes("attractions")
                    ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                    : darkMode
                      ? "bg-slate-800/80 text-gray-300 hover:bg-slate-700"
                      : "bg-white/80 text-gray-700 hover:bg-white shadow-md"
                }`}
              >
                <FerrisWheel className="w-5 h-5" />
                אטרקציות
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedCategories(
                    selectedCategories.includes("culture")
                      ? selectedCategories.filter((c) => c !== "culture")
                      : [...selectedCategories, "culture"],
                  );
                }}
                className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium backdrop-blur-sm ${
                  selectedCategories.includes("culture")
                    ? "bg-gradient-to-br from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/30"
                    : darkMode
                      ? "bg-slate-800/80 text-gray-300 hover:bg-slate-700"
                      : "bg-white/80 text-gray-700 hover:bg-white shadow-md"
                }`}
              >
                <Drama className="w-5 h-5" />
                תרבות
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedCategories(
                    selectedCategories.includes("hiking")
                      ? selectedCategories.filter((c) => c !== "hiking")
                      : [...selectedCategories, "hiking"],
                  );
                }}
                className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium backdrop-blur-sm ${
                  selectedCategories.includes("hiking")
                    ? "bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30"
                    : darkMode
                      ? "bg-slate-800/80 text-gray-300 hover:bg-slate-700"
                      : "bg-white/80 text-gray-700 hover:bg-white shadow-md"
                }`}
              >
                <Footprints className="w-5 h-5" />
                טיולים
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedCategories(
                    selectedCategories.includes("events")
                      ? selectedCategories.filter((c) => c !== "events")
                      : [...selectedCategories, "events"],
                  );
                }}
                className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium backdrop-blur-sm ${
                  selectedCategories.includes("events")
                    ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30"
                    : darkMode
                      ? "bg-slate-800/80 text-gray-300 hover:bg-slate-700"
                      : "bg-white/80 text-gray-700 hover:bg-white shadow-md"
                }`}
              >
                <PartyPopper className="w-5 h-5" />
                אירועים
              </motion.button>
            </motion.div>
          </div>
        </div>

        <main className="relative">
          {/* Desktop Layout - Two independent scrolls */}
          <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-6 items-start relative">
              {/* Filter Section - Sticky on the right (first in RTL) */}
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.25,
                      ease: "easeInOut",
                    }}
                    className="sticky top-24"
                    style={{
                      width: "40%",
                      maxHeight: "calc(100vh - 6rem)",
                      height: "calc(100vh - 6rem)",
                      alignSelf: "flex-start",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      className="w-full h-full"
                      style={{ minWidth: "500px" }}
                    >
                      <FilterSection
                        selectedFilters={selectedFilters}
                        toggleFilter={toggleFilter}
                        darkMode={darkMode}
                        showWeather={showWeather}
                        setShowWeather={setShowWeather}
                        setDarkMode={setDarkMode}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        isOpenNow={isOpenNow}
                        setIsOpenNow={setIsOpenNow}
                        isOpenWeekend={isOpenWeekend}
                        setIsOpenWeekend={setIsOpenWeekend}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        selectedTimeOfDay={selectedTimeOfDay}
                        setSelectedTimeOfDay={setSelectedTimeOfDay}
                        kidFriendly={kidFriendly}
                        setKidFriendly={setKidFriendly}
                        photoOpportunity={photoOpportunity}
                        setPhotoOpportunity={setPhotoOpportunity}
                        experienceType={experienceType}
                        setExperienceType={setExperienceType}
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                        nearMe={nearMe}
                        setNearMe={setNearMe}
                        displayMode={displayMode}
                        setDisplayMode={setDisplayMode}
                        groupType={groupType}
                        setGroupType={setGroupType}
                        filteredCount={filteredCount}
                        onFilteredCountChange={handleFilteredCountChange}
                        showFavoritesOnly={showFavoritesOnly}
                        setShowFavoritesOnly={setShowFavoritesOnly}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Experience Grid - Scrollable feed on the left (second in RTL) */}
              <div className="flex-1 min-w-0">
                <ExperienceContainer
                  selectedFilters={selectedFilters}
                  darkMode={darkMode}
                  isFilterOpen={isFilterOpen}
                  searchQuery={searchQuery}
                  selectedCategories={selectedCategories}
                  isOpenNow={isOpenNow}
                  isOpenWeekend={isOpenWeekend}
                  selectedTimeOfDay={selectedTimeOfDay}
                  nearMe={nearMe}
                  experienceType={experienceType}
                  groupType={groupType}
                  displayMode={displayMode}
                  priceRange={priceRange}
                  onFilteredCountChange={handleFilteredCountChange}
                  showFavoritesOnly={showFavoritesOnly}
                />
              </div>
            </div>
          </div>

          {/* Mobile Feed - Always visible, unaffected by filter */}
          <div className="md:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ExperienceContainer
              selectedFilters={selectedFilters}
              darkMode={darkMode}
              isFilterOpen={isFilterOpen}
              searchQuery={searchQuery}
              selectedCategories={selectedCategories}
              isOpenNow={isOpenNow}
              isOpenWeekend={isOpenWeekend}
              selectedTimeOfDay={selectedTimeOfDay}
              nearMe={nearMe}
              experienceType={experienceType}
              groupType={groupType}
              displayMode={displayMode}
              priceRange={priceRange}
              onFilteredCountChange={handleFilteredCountChange}
              showFavoritesOnly={showFavoritesOnly}
            />
          </div>
        </main>
      </div>

      {/* Floating Search Button */}
      <FloatingNotification
        isOpen={isFilterOpen}
        onClick={handleFilterToggle}
        isVisible={true}
        scrollY={scrollY}
        showWeather={showWeather}
        setShowWeather={setShowWeather}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        selectedFilters={selectedFilters}
        activeFiltersCount={getActiveFiltersCount()}
        cartItemsCount={cartItemsCount}
      />
    </div>
  );
}
