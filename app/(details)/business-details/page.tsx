'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowRight, MapPin, Clock, Heart, Share2, Phone, Mail,
  Accessibility, Car, PawPrint, Home, Sparkles, Globe, Navigation,
  Sunrise, Sunset, Sun, Moon, Calendar, DollarSign, Timer, Users,
  Star, ShoppingCart, Plus, Minus, MapPinned, X
} from 'lucide-react';
import { experiencesData } from '@/data/experiences';

// Mock products for this business
const mockProducts = [
  {
    id: 1,
    name: 'סיור מודרך במכתש',
    description: 'סיור מודרך של 3 שעות במכתש רמון עם מדריך מקצועי',
    price: 150,
    duration: '3 שעות',
    image: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=400&h=300&fit=crop',
    rating: 4.8,
    reviews: 124,
    deliveryCost: 0,
  },
  {
    id: 2,
    name: 'טיול שקיעה',
    description: 'צפייה בשקיעה המדהימה מנקודת תצפית מיוחדת',
    price: 80,
    duration: '2 שעות',
    image: 'https://images.unsplash.com/photo-1662961345124-c8f747c38181?w=400&h=300&fit=crop',
    rating: 4.9,
    reviews: 89,
    deliveryCost: 0,
  },
  {
    id: 3,
    name: 'מסלול ג\'יפים',
    description: 'מסלול ג\'יפים מרגש בשטח המכתש',
    price: 200,
    duration: '4 שעות',
    image: 'https://images.unsplash.com/photo-1625310666597-891f2d527a5f?w=400&h=300&fit=crop',
    rating: 4.7,
    reviews: 156,
    deliveryCost: 0,
  },
  {
    id: 4,
    name: 'סדנת צילום',
    description: 'סדנת צילום טבע במכתש עם צלם מקצועי',
    price: 180,
    duration: '5 שעות',
    image: 'https://images.unsplash.com/photo-1546814082-b5f4db989a4b?w=400&h=300&fit=crop',
    rating: 5.0,
    reviews: 43,
    deliveryCost: 0,
  },
];

export default function BusinessPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const productScrollRef = useRef<HTMLDivElement>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [cartItems, setCartItems] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHoursModal, setShowHoursModal] = useState(false);

  const experience = experiencesData.find((exp) => exp.id === Number(id));

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (thumbnailRefs.current[selectedImage]) {
      thumbnailRefs.current[selectedImage]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [selectedImage]);

  const isCurrentlyOpen = (openingHours: any) => {
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todayHours = openingHours[currentDay];
    if (!todayHours) return false;

    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    return currentTime >= openTime && currentTime <= closeTime;
  };

  const getTimeOfDayIcon = (time: string) => {
    if (time === 'זריחה') return <Sunrise className="w-4 h-4" />;
    if (time === 'שקיעה') return <Sunset className="w-4 h-4" />;
    if (time === 'לילה') return <Moon className="w-4 h-4" />;
    return <Sun className="w-4 h-4" />;
  };

  const handleAddToCart = (productId: number) => {
    setCartItems((prev) => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  if (!experience) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100" dir="rtl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">החוויה לא נמצאה</h1>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
          >
            חזרה לדף הבית
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`} dir="rtl">

      {/* Hours Modal */}
      {showHoursModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
          onClick={() => setShowHoursModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-3xl shadow-2xl p-8 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>שעות פעילות</h3>
              <button
                onClick={() => setShowHoursModal(false)}
                className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { key: 'sunday', label: 'ראשון' },
                { key: 'monday', label: 'שני' },
                { key: 'tuesday', label: 'שלישי' },
                { key: 'wednesday', label: 'רביעי' },
                { key: 'thursday', label: 'חמישי' },
                { key: 'friday', label: 'שישי' },
                { key: 'saturday', label: 'שבת' },
              ].map((day) => {
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const today = dayNames[new Date().getDay()];
                const isToday = day.key === today;
                const hours = experience.openingHours[day.key];

                return (
                  <div
                    key={day.key}
                    className={`flex items-center justify-between py-3 px-4 rounded-xl ${
                      isToday
                        ? darkMode ? 'bg-teal-900/30' : 'bg-teal-50'
                        : darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
                    }`}
                  >
                    <span className={`text-base font-medium ${
                      isToday
                        ? darkMode ? 'text-teal-400' : 'text-teal-600'
                        : darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {day.label}
                    </span>
                    <span className={`text-base font-bold ${
                      isToday
                        ? darkMode ? 'text-teal-400' : 'text-teal-600'
                        : darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {hours ? `${hours.open} - ${hours.close}` : 'סגור'}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Back Button & Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => router.push('/')}
            className={`px-3 sm:px-4 py-2 flex items-center gap-2 transition-all hover:opacity-70 min-h-[44px] ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">חזרה</span>
          </button>

          <div className="flex gap-2 sm:gap-3 mt-6 mr-auto">
            <motion.button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2.5 sm:p-3 rounded-2xl shadow-md hover:shadow-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${
                darkMode ? 'bg-slate-800' : 'bg-white'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={isFavorite ? {
                  scale: [1, 1.3, 1],
                  rotate: [0, -10, 10, -5, 0]
                } : {}}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <Heart className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                  isFavorite ? 'fill-red-500 text-red-500' : darkMode ? 'text-gray-300' : 'text-gray-600'
                }`} />
              </motion.div>
            </motion.button>

            <a
              href={`https://waze.com/ul?q=${encodeURIComponent(experience.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2.5 sm:p-3 rounded-2xl shadow-md hover:shadow-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${
                darkMode ? 'bg-slate-800' : 'bg-white'
              }`}
            >
              <Navigation className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} />
            </a>

            <a href={`tel:${experience.phone}`} className={`p-2.5 sm:p-3 rounded-2xl shadow-md hover:shadow-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <Phone className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </a>
            <a href={`mailto:${experience.email}`} className={`p-2.5 sm:p-3 rounded-2xl shadow-md hover:shadow-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <Mail className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </a>
            <button className={`p-2.5 sm:p-3 rounded-2xl shadow-md hover:shadow-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <Share2 className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* UNIFIED HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl shadow-lg overflow-hidden mb-8 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
        >
          {/* Logo & Title Header */}
          <div className="relative p-8 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
              <div className="flex-shrink-0">
                <img
                  src={experience.logo}
                  alt={`לוגו ${experience.title}`}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-xl ring-4 ring-white"
                />
              </div>

              <div className="flex-1">
                <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{experience.title}</h1>
                {experience.subtitle && (
                  <p className={`text-lg sm:text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{experience.subtitle}</p>
                )}
              </div>

              {/* Open/Closed Badge */}
              <motion.button
                onClick={() => setShowHoursModal(true)}
                whileTap={{ scale: 0.95 }}
                className="absolute top-8 left-8 cursor-pointer"
              >
                {isCurrentlyOpen(experience.openingHours) ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all bg-teal-500 hover:bg-teal-600">
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                    <span className="text-white font-bold text-sm">פתוח עכשיו</span>
                  </div>
                ) : (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all ${
                    darkMode ? 'bg-red-600 hover:bg-red-500' : 'bg-red-500 hover:bg-red-600'
                  }`}>
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    <span className="text-white font-bold text-sm">סגור</span>
                  </div>
                )}
              </motion.button>
            </div>

            {/* Description */}
            <p className={`text-base sm:text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{experience.description}</p>
          </div>

          {/* Gallery */}
          <div className="relative h-[400px] sm:h-[500px] bg-gray-200">
            <motion.img
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              src={experience.gallery[selectedImage]}
              alt={experience.title}
              className="w-full h-full object-cover"
            />

            {experience.gallery.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((prev) => (prev === experience.gallery.length - 1 ? 0 : prev + 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-xl hover:scale-110 hover:bg-gray-100 transition-all z-20"
                >
                  <ArrowRight className="w-6 h-6 text-gray-900 rotate-180" />
                </button>

                <button
                  onClick={() => setSelectedImage((prev) => (prev === 0 ? experience.gallery.length - 1 : prev - 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-xl hover:scale-110 hover:bg-gray-100 transition-all z-20"
                >
                  <ArrowRight className="w-6 h-6 text-gray-900" />
                </button>

                {/* Thumbnails */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                  <div className="flex gap-2">
                    {experience.gallery.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden transition-all ${
                          selectedImage === index
                            ? 'ring-3 ring-teal-400 opacity-100 scale-105 shadow-2xl'
                            : 'opacity-60 hover:opacity-100 hover:scale-105 shadow-xl'
                        }`}
                        style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6))' }}
                        ref={(el) => { thumbnailRefs.current[index] = el; }}
                      >
                        <img src={img} alt={`תמונה ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Experience Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-3xl shadow-lg p-8 mb-8 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
        >
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>פרטים שחשוב להכיר</h2>

          <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2">
            {experience.groupType && experience.groupType.map((group: string, index: number) => (
              <div key={`group-${index}`} className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                darkMode ? 'bg-slate-700 text-gray-200' : 'bg-gray-100 text-gray-700'
              }`}>
                <span className="text-sm font-medium">{group}</span>
              </div>
            ))}

            {experience.accessibility && experience.accessibility.map((item: string, index: number) => (
              <div key={`access-${index}`} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                darkMode ? 'bg-slate-700 text-gray-200' : 'bg-gray-100 text-gray-700'
              }`}>
                <Accessibility className="w-4 h-4" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}

            {experience.amenities && experience.amenities.map((amenity: string, index: number) => {
              let icon = <Home className="w-4 h-4" />;
              if (amenity === 'נגיש') icon = <Accessibility className="w-4 h-4" />;
              if (amenity === 'חניה') icon = <Car className="w-4 h-4" />;
              if (amenity === 'ידידותי לחיות') icon = <PawPrint className="w-4 h-4" />;

              return (
                <div key={`amenity-${index}`} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                  darkMode ? 'bg-slate-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                }`}>
                  {icon}
                  <span className="text-sm font-medium">{amenity}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`rounded-3xl shadow-lg p-6 sm:p-8 mb-8 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
        >
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>המוצרים שלנו</h2>

          <div
            ref={productScrollRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {mockProducts.map((product) => (
              <div
                key={product.id}
                className={`flex-shrink-0 w-[280px] sm:w-[300px] rounded-2xl overflow-hidden shadow-lg snap-start relative ${
                  darkMode ? 'bg-slate-700' : 'bg-white border border-gray-200'
                }`}
              >
                <button
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="w-full text-right"
                >
                  <div className="relative h-48">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4 pb-14">
                    <h3 className={`text-xl font-bold mb-2 line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {product.name}
                    </h3>
                    <p className={`text-sm mb-2 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {product.description}
                    </p>

                    <div className="mb-2">
                      <p className={`text-xs mb-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>מחיר</p>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={`text-xl font-bold ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                          ₪{product.price}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>+</span>
                          <span className={`text-base font-bold ${
                            product.deliveryCost === 0
                              ? darkMode ? 'text-teal-400' : 'text-teal-600'
                              : darkMode ? 'text-orange-400' : 'text-orange-600'
                          }`}>
                            {product.deliveryCost === 0 ? 'משלוח חינם' : `₪${product.deliveryCost}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Action Buttons */}
                <div className="absolute bottom-2 left-3 right-3 flex gap-2 justify-end">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className="px-4 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!cartItems.includes(product.id)) {
                        handleAddToCart(product.id);
                      }
                      router.push(`/product/${product.id}`);
                    }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>רכישה</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className={`w-12 h-12 rounded-xl transition-all flex items-center justify-center text-sm font-medium ${
                      cartItems.includes(product.id)
                        ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30'
                        : darkMode
                          ? 'bg-slate-800 text-gray-300 hover:bg-slate-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product.id);
                    }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {mockProducts.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === 0 ? 'w-8 bg-teal-500' : 'w-1.5 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-3xl shadow-lg overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
        >
          <div className="p-6 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <MapPinned className={`w-6 h-6 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} />
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>אנחנו על המפה</h2>
            </div>
          </div>
          <div className="w-full h-80 bg-gray-200">
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(experience.location)}&zoom=14`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
