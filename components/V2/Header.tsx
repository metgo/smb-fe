import { Search, Menu, Sparkles, ShoppingCart, List, Map, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import logoLight from 'figma:asset/0be46eb4225cebd1c6475524f4dbcc07ea768b28.png';
import logoDark from 'figma:asset/b4ac6ffc4f5fefe65ca76fff8a923f5124497928.png';
import { 
  UtensilsCrossed, 
  Hotel, 
  FerrisWheel, 
  Drama, 
  Footprints, 
  PartyPopper 
} from 'lucide-react';
import { CartModal } from './CartModal';

interface HeaderProps {
  darkMode?: boolean;
  showWeather?: boolean;
  cartItemsCount?: number;
  viewMode?: 'feed' | 'map';
  setViewMode?: (value: 'feed' | 'map') => void;
  showTitle?: boolean;
  showCategoriesDropdown?: boolean;
  selectedCategories?: string[];
  onCategoryToggle?: (category: string) => void;
  isMobile?: boolean;
  showCompactHeader?: boolean;
  scrollDirection?: 'up' | 'down';
  scrollY?: number;
}

export function Header({ 
  darkMode, 
  showWeather = false, 
  cartItemsCount = 0, 
  viewMode = 'feed', 
  setViewMode, 
  showTitle = false,
  showCategoriesDropdown = false,
  selectedCategories = [],
  onCategoryToggle,
  isMobile = false,
  showCompactHeader = false,
  scrollDirection,
  scrollY
}: HeaderProps) {
  const [hasAnimated, setHasAnimated] = useState(() => {
    // Check immediately on mount
    return sessionStorage.getItem('headerAnimated') === 'true';
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    // Set the flag after first animation
    if (!hasAnimated) {
      sessionStorage.setItem('headerAnimated', 'true');
    }
  }, [hasAnimated]);

  const categories = [
    { id: 'food', label: 'אוכל', icon: UtensilsCrossed, gradient: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/30' },
    { id: 'accommodation', label: 'לינה', icon: Hotel, gradient: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/30' },
    { id: 'attractions', label: 'אטרקציות', icon: FerrisWheel, gradient: 'from-green-500 to-emerald-500', shadow: 'shadow-green-500/30' },
    { id: 'culture', label: 'תרבות', icon: Drama, gradient: 'from-purple-500 to-violet-500', shadow: 'shadow-purple-500/30' },
    { id: 'hiking', label: 'טיולים', icon: Footprints, gradient: 'from-teal-500 to-cyan-500', shadow: 'shadow-teal-500/30' },
    { id: 'events', label: 'אירועים', icon: PartyPopper, gradient: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/30' },
  ];

  const handleCategoryClick = (categoryId: string) => {
    if (onCategoryToggle) {
      onCategoryToggle(categoryId);
    }
  };

  const getSelectedCategoryLabel = () => {
    if (selectedCategories.length === 0) return 'קטגוריות';
    if (selectedCategories.length === 1) {
      const category = categories.find(c => c.id === selectedCategories[0]);
      return category?.label || 'קטגוריות';
    }
    return `${selectedCategories.length} קטגוריות`;
  };

  return (
    <>
      <motion.header
        initial={hasAnimated ? false : { y: -100 }}
        animate={hasAnimated ? false : { y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
          darkMode 
            ? 'bg-slate-900/95 border-slate-700' 
            : 'bg-white/95 border-gray-200'
        } ${isMobile && showCompactHeader ? 'py-2' : ''}`}
        style={{
          transform: isMobile && showCompactHeader ? 'translateY(0)' : undefined
        }}
      >
        <div className={`max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between transition-all duration-300 ${
          isMobile && showCompactHeader ? 'py-2' : 'py-4'
        }`}>
          {/* Logo and Menu on the right side */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-xl transition-colors ${
                darkMode 
                  ? 'hover:bg-slate-800 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Menu className="w-6 h-6" />
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <img
                src={darkMode ? logoDark : logoLight}
                alt="Negev Logo"
                className="h-10 w-auto object-contain"
                style={{ maxWidth: '160px' }}
              />
            </motion.div>
          </div>

          {/* Weather and Cart on the left side */}
          {/* Title in center, Weather and Cart on the left side */}
          <AnimatePresence mode="wait">
            {showTitle && (
              <motion.div
                key="header-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ 
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-4"
              >
                <h2 
                  className={`hidden md:block ${darkMode ? 'text-white' : 'text-gray-900'} whitespace-nowrap`}
                  style={{ 
                    fontFamily: 'Ploni, Rubik, sans-serif',
                    fontWeight: 300,
                    fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                    letterSpacing: '-0.02em'
                  }}
                >
                  לוקחים נשימה
                </h2>
                
                {showCategoriesDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                        selectedCategories.length > 0
                          ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30'
                          : darkMode
                            ? 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                            : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                      }`}
                    >
                      <span className="text-sm font-medium">{getSelectedCategoryLabel()}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </motion.button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className={`absolute top-full mt-2 left-1/2 transform -translate-x-1/2 rounded-2xl shadow-2xl overflow-hidden z-50 ${
                            darkMode ? 'bg-slate-800' : 'bg-white'
                          }`}
                          style={{ minWidth: '280px' }}
                        >
                          <div className="p-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {categories.map((category) => {
                              const Icon = category.icon;
                              const isSelected = selectedCategories.includes(category.id);
                              return (
                                <motion.button
                                  key={category.id}
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => {
                                    handleCategoryClick(category.id);
                                  }}
                                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                                    isSelected
                                      ? `bg-gradient-to-br ${category.gradient} text-white shadow-lg ${category.shadow}`
                                      : darkMode
                                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                  <span>{category.label}</span>
                                </motion.button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-4">
            {/* Weather Widget on the left */}
            <AnimatePresence mode="wait">
              {showWeather && (
                <motion.div
                  key="weather"
                  initial={{ opacity: 0, x: -20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.9 }}
                  transition={{ 
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  className={`hidden md:flex items-center h-10 px-4 py-2 rounded-2xl backdrop-blur-md shadow-sm ${
                    darkMode ? 'bg-slate-800/40' : 'bg-white/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Temperature on the right */}
                    <div className="text-left">
                      <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>28°</div>
                    </div>
                    {/* Weather icon on the left */}
                    <div className="relative w-6 h-6">
                      {/* Solid sun circle with rays */}
                      <svg 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        className={`w-full h-full ${darkMode ? 'text-amber-300' : 'text-amber-500'}`}
                        style={{ filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.4))' }}
                      >
                        {/* Center circle - filled */}
                        <circle cx="12" cy="12" r="5" fill="currentColor" />
                        {/* Rays */}
                        <circle cx="12" cy="3" r="1.5" fill="currentColor" />
                        <circle cx="12" cy="21" r="1.5" fill="currentColor" />
                        <circle cx="3" cy="12" r="1.5" fill="currentColor" />
                        <circle cx="21" cy="12" r="1.5" fill="currentColor" />
                        <circle cx="5.6" cy="5.6" r="1.5" fill="currentColor" />
                        <circle cx="18.4" cy="18.4" r="1.5" fill="currentColor" />
                        <circle cx="5.6" cy="18.4" r="1.5" fill="currentColor" />
                        <circle cx="18.4" cy="5.6" r="1.5" fill="currentColor" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-2 rounded-xl transition-colors ${ 
                darkMode  
                  ? 'hover:bg-slate-800 text-gray-300'  
                  : 'hover:bg-gray-100 text-gray-700' 
              }`}
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center"
                >
                  <span className="text-white text-xs font-bold leading-none">{cartItemsCount}</span>
                </motion.div>
              )}
            </motion.button>

            {/* View Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-xl transition-colors ${ 
                darkMode  
                  ? 'hover:bg-slate-800 text-gray-300'  
                  : 'hover:bg-gray-100 text-gray-700' 
              }`}
              onClick={() => setViewMode && setViewMode(viewMode === 'feed' ? 'map' : 'feed')}
            >
              {viewMode === 'feed' ? <List className="w-6 h-6" /> : <Map className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Secondary Mobile Category Bar */}
      <AnimatePresence>
        {isMobile && showCategoriesDropdown && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            className={`fixed top-[72px] left-0 right-0 z-40 backdrop-blur-md border-b ${
              darkMode 
                ? 'bg-slate-900/95 border-slate-700' 
                : 'bg-white/95 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-around px-4 py-3">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <motion.button
                    key={category.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex items-center justify-center px-3 py-3 rounded-xl transition-all ${
                      isSelected
                        ? `bg-gradient-to-br ${category.gradient} text-white shadow-lg ${category.shadow}`
                        : darkMode
                          ? 'bg-slate-800/80 text-gray-300 hover:bg-slate-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected ? (
                      <span className="text-sm font-medium whitespace-nowrap">{category.label}</span>
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} darkMode={darkMode} />
    </>
  );
}