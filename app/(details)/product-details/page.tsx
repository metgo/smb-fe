"use client";

import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  Heart,
  Share2,
  ShoppingCart,
  Plus,
  Minus,
  Star,
  Users,
  Check,
  Truck,
  Calendar,
  Sparkles,
  X,
  Leaf,
  Wheat,
  Accessibility,
  Baby,
  UserCheck,
} from "lucide-react";

// Extended mock products with full details
const mockProducts = [
  {
    id: 1,
    businessId: 1,
    name: "סיור מודרך במכתש",
    shortDescription: "סיור מודרך של 3 שעות במכתש רמון עם מדריך מקצועי",
    longDescription:
      "חוויה בלתי נשכחת של סיור מודרך במכתש רמון. הסיור כולל הסבר מפורט על היווצרות המכתש, הגיאולוגיה המיוחדת של האזור, והחי והצומח המדברי. המדריכים המקצועיים שלנו ילוו אתכם לאורך כל הדרך ויספרו לכם על ההיסטוריה, התרבות והטבע המרהיב של הנגב. הסיור מתאים לכל הגילאים ורמות הכושר.",
    price: 150,
    duration: "3 שעות",
    gallery: [
      "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1682687220198-88e9bdea9931?w=800&h=600&fit=crop",
    ],
    rating: 4.8,
    reviews: 124,
    groupSize: "עד 15 איש",
    included: ["מדריך מקצועי", "מים וחטיפים", "ביטוח", "ציוד בטיחות"],
    availability: "ראשון - חמישי 09:00-17:00",
    minAge: 6,
    difficulty: "קל-בינוני",
    accessibility: [
      { label: "ידידותי לילדים", icon: "Baby" },
      { label: "מתאים למשפחות", icon: "Users" },
    ],
    delivery: {
      available: true,
      zones: [
        { name: "אזור הנגב", cost: 0, description: "משלוח חינם" },
        { name: "מרכז הארץ", cost: 50, description: "באר שבע, אשדוד, אשקלון" },
        { name: "אזור ירושלים", cost: 60, description: "ירושלים והסביבה" },
        { name: "גוש דן", cost: 80, description: "תל אביב והסביבה" },
        { name: "צפון הארץ", cost: 120, description: "חיפה, נצרת, טבריה" },
      ],
    },
  },
  {
    id: 2,
    businessId: 1,
    name: "טיול שקיעה",
    shortDescription: "צפייה בשקיעה המדהימה מנקודת תצפית מיוחדת",
    longDescription:
      "חוויה רומנטית ומרגשת של צפייה בשקיעה במדבר. נצא למסע קצר לנקודת תצפית ייחודית המשקיפה על המכתש כולו. תוכלו ליהנות משקיעה מרהיבה עם צבעים משתנים, אור קסום ותחושת של שקט ושלווה. הטיול כולל משקאות חמים וכיבוד קל. אידיאלי לזוגות, משפחות וחובבי צילום.",
    price: 80,
    duration: "2 שעות",
    gallery: [
      "https://images.unsplash.com/photo-1662961345124-c8f747c38181?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&h=600&fit=crop",
    ],
    rating: 4.9,
    reviews: 89,
    groupSize: "עד 20 איש",
    included: ["משקאות חמים", "כיבוד קל", "כיסאות ושמיכות", "מדריך"],
    availability: "כל יום 16:00-19:00",
    minAge: 3,
    difficulty: "קל",
    accessibility: [
      { label: "נגיש לכיסאות גלגלים", icon: "Accessibility" },
      { label: "מתאים לקשישים", icon: "UserCheck" },
      { label: "ידידותי לילדים", icon: "Baby" },
    ],
  },
  {
    id: 3,
    businessId: 1,
    name: "מסלול ג'יפים",
    shortDescription: "מסלול ג'יפים מרגש בשטח המכתש",
    longDescription:
      "הרפתקה אקסטרים בשטח המכתש! נסיעה בג'יפים שטח מקצועיים דרך שבילי עפר, ואדיות, וערוצי נחלים. הסיור כולל עצירות בנקודות תצפית מדהימות, הסברים על הגיאולוגיה והטבע של האזור, וחוויה בלתי נשכחת לכל המשפחה. הנהגים המנוסים שלנו ידאגו לנסיעה בטוחה ומרגשת. מתאים למבוגרים וילדים מגיל 8.",
    price: 200,
    duration: "4 שעות",
    gallery: [
      "https://images.unsplash.com/photo-1625310666597-891f2d527a5f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&h=600&fit=crop",
    ],
    rating: 4.7,
    reviews: 156,
    groupSize: "עד 6 איש לג'יפ",
    included: ["ג'יפ שטח מקצועי", "נהג מדריך", "מים וחטיפים", "ביטוח מלא"],
    availability: "כל יום 08:00-16:00",
    minAge: 8,
    difficulty: "בינוני",
    accessibility: [{ label: "מתאים למשפחות", icon: "Users" }],
  },
  {
    id: 4,
    businessId: 1,
    name: "סדנת צילום",
    shortDescription: "סדנת צילום טבע במכתש עם צלם מקצועי",
    longDescription:
      "למדו לצלם כמו מקצוענים! סדנת צילום מקיפה במכתש רמון עם צלם נוף מקצועי. נלמד טכניקות צילום בסיסיות ומתקדמות, קומפוזיציה, עבודה עם אור טבעי, וצילום נוף מדברי. הסדנה כוללת יציאה לנקודות צילום ייחודיות, תרגול מעשי, וביקורת פרטנית על התמונות שלכם. מתאים למתחילים ומתקדמים כאחד. מומלץ להגיע עם מצלמה DSLR או מצלמת טלפון מתקדמת.",
    price: 180,
    duration: "5 שעות",
    gallery: [
      "https://images.unsplash.com/photo-1546814082-b5f4db989a4b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1662961345124-c8f747c38181?w=800&h=600&fit=crop",
    ],
    rating: 5.0,
    reviews: 43,
    groupSize: "עד 8 איש",
    included: [
      "מדריך צילום מקצועי",
      "חומרי לימוד",
      "מים וחטיפים",
      "גישה לנקודות צילום ייחודיות",
    ],
    availability: "שישי-שבת 06:00-13:00",
    minAge: 12,
    difficulty: "קל-בינוני",
    accessibility: [{ label: "מתאים למשפחות", icon: "Users" }],
  },
  {
    id: 5,
    businessId: 2,
    name: "ארוחת בוקר מדברית",
    shortDescription: "ארוחת בוקר עשירה עם נוף למדבר",
    longDescription:
      "התחילו את היום בצורה הטובה ביותר עם ארוחת בוקר מדברית עשירה ומפנקת. תיהנו ממגוון גדול של סלטים טריים, גבינות איכותיות, לחמים אפויים במקום, שקשוקה חמה, מאפים ביתיים, ומיצים טבעיים. כל זאת כשאתם יושבים על הטרסה שלנו עם נוף פנורמי מרהיב של המכתש. האווירה השקטה והנוף העוצר נשימה יהפכו את הבוקר שלכם לבלתי נשכח.",
    price: 75,
    duration: "1.5 שעה",
    gallery: [
      "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=600&fit=crop",
    ],
    rating: 4.9,
    reviews: 267,
    groupSize: "בודד או קבוצות",
    included: ["ארוחה עשירה", "משקאות חמים", "מיצים טריים", "נוף מרהיב"],
    availability: "כל יום 07:00-11:00",
    minAge: 0,
    difficulty: "קל",
    accessibility: [
      { label: "אופציות צמחוניות", icon: "Leaf" },
      { label: "אופציות טבעוניות", icon: "Leaf" },
      { label: "ללא גלוטן", icon: "Wheat" },
      { label: "נגיש לכיסאות גלגלים", icon: "Accessibility" },
      { label: "מתאים לקשישים", icon: "UserCheck" },
      { label: "ידידותי לילדים", icon: "Baby" },
    ],
  },
];

export default function ProductPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [cartItems, setCartItems] = useState<number[]>(() => {
    const saved = localStorage.getItem("cartItems");
    return saved ? JSON.parse(saved) : [];
  });
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  const product = mockProducts.find((prod) => prod.id === Number(id));
  // const business = product ? experiencesData.find((exp) => exp.id === product.businessId) : null;
  const relatedProducts = product
    ? mockProducts.filter(
        (p) => p.businessId === product.businessId && p.id !== product.id,
      )
    : [];

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (thumbnailRefs.current[selectedImage]) {
      thumbnailRefs.current[selectedImage]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedImage]);

  const handleAddToCart = (productId: number, qty: number = 1) => {
    setCartItems((prev) => {
      const newItems = [...prev];
      for (let i = 0; i < qty; i++) {
        newItems.push(productId);
      }
      return newItems;
    });
  };

  const handleQuickPurchase = () => {
    handleAddToCart(product!.id, quantity);
    // Navigate to checkout page (would need to create this)
    console.log("Navigate to checkout with quantity:", quantity);
  };

  // Helper function to get icon component
  const getAccessibilityIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Leaf,
      Wheat,
      Accessibility,
      Baby,
      UserCheck,
      Users,
    };
    return icons[iconName] || Check;
  };

  if (!product) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-100"
        dir="rtl"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            המוצר לא נמצא
          </h1>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
          >
            חזרה לדף הבית
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 bg-gray-50`}
      dir="rtl"
    >
      {/* Delivery Modal */}
      {showDeliveryModal && product.delivery && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
          onClick={() => setShowDeliveryModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-3xl shadow-2xl p-8 bg-white`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-bold text-gray-900`}>
                אזורי משלוח
              </h3>
              <button
                onClick={() => setShowDeliveryModal(false)}
                className={`p-2 rounded-xl transition-colors hover:bg-gray-100`}
              >
                <X className={`w-6 h-6 text-gray-600`} />
              </button>
            </div>

            <div className="space-y-3">
              {product.delivery.zones.map((zone, index) => (
                <div key={index} className={`rounded-xl p-4 bg-gray-50`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-lg font-bold text-gray-900`}>
                      {zone.name}
                    </span>
                    <span
                      className={`text-xl font-bold ${
                        zone.cost === 0 ? "text-teal-600" : "text-orange-600"
                      }`}
                    >
                      {zone.cost === 0 ? "חינם" : `₪${zone.cost}`}
                    </span>
                  </div>
                  <p className={`text-sm text-gray-600`}>{zone.description}</p>
                </div>
              ))}
            </div>

            <div
              className={`mt-6 p-4 rounded-xl bg-teal-50 border border-teal-200`}
            >
              <div className="flex items-start gap-3">
                <Truck
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 text-teal-600`}
                />
                <p className={`text-sm text-gray-700`}>
                  עלות המשלוח תתווסף למחיר הסופי בעמוד התשלום
                </p>
              </div>
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
            onClick={() => router.back()}
            className={`px-3 sm:px-4 py-2 flex items-center gap-2 transition-all hover:opacity-70 min-h-[44px] text-gray-900`}
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">חזרה</span>
          </button>

          <div className="flex gap-2 sm:gap-3 mt-6 mr-auto">
            <motion.button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2.5 sm:p-3 rounded-2xl shadow-md hover:shadow-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center bg-white`}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={
                  isFavorite
                    ? {
                        scale: [1, 1.3, 1],
                        rotate: [0, -10, 10, -5, 0],
                      }
                    : {}
                }
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <Heart
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                  }`}
                />
              </motion.div>
            </motion.button>

            <button
              className={`p-2.5 sm:p-3 rounded-2xl shadow-md hover:shadow-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center bg-white`}
            >
              <Share2 className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-600`} />
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
          className={`rounded-3xl shadow-lg overflow-hidden mb-8 bg-white`}
        >
          {/* Product Header */}
          <div className="relative p-8 pb-6">
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
              <div className="flex-1">
                <h1
                  className={`text-3xl sm:text-4xl font-bold mb-3 text-gray-900`}
                >
                  {product.name}
                </h1>

                <p className={`text-lg text-gray-600 mb-4`}>
                  {product.shortDescription}
                </p>
                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold text-teal-600`}>
                    ₪{product.price}
                  </span>
                  {product.delivery && (
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-xl text-gray-400`}>+</span>
                      <span
                        className={`text-2xl font-bold ${
                          product.delivery.zones[0].cost === 0
                            ? "text-teal-600"
                            : "text-orange-600"
                        }`}
                      >
                        {product.delivery.zones[0].cost === 0
                          ? "משלוח חינם"
                          : `₪${product.delivery.zones[0].cost}`}
                      </span>
                      <span className={`text-sm text-gray-500`}>משלוח</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="relative h-[400px] sm:h-[500px] bg-gray-200">
            <motion.img
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              src={product.gallery[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />

            {product.gallery.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImage((prev) =>
                      prev === product.gallery.length - 1 ? 0 : prev + 1,
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-xl hover:scale-110 hover:bg-gray-100 transition-all z-20"
                >
                  <ArrowRight className="w-6 h-6 text-gray-900 rotate-180" />
                </button>

                <button
                  onClick={() =>
                    setSelectedImage((prev) =>
                      prev === 0 ? product.gallery.length - 1 : prev - 1,
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-xl hover:scale-110 hover:bg-gray-100 transition-all z-20"
                >
                  <ArrowRight className="w-6 h-6 text-gray-900" />
                </button>

                {/* Thumbnails */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                  <div className="flex gap-2">
                    {product.gallery.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden transition-all ${
                          selectedImage === index
                            ? "ring-3 ring-teal-400 opacity-100 scale-105 shadow-2xl"
                            : "opacity-60 hover:opacity-100 hover:scale-105 shadow-xl"
                        }`}
                        style={{
                          filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6))",
                        }}
                        // ref={(el) => (thumbnailRefs.current[index] = el)}
                      >
                        <img
                          src={img}
                          alt={`תמונה ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Quantity & Purchase Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-3xl shadow-lg p-6 sm:p-8 mb-8 bg-white`}
        >
          <h2 className={`text-2xl font-bold mb-6 text-gray-900`}>בחר כמות</h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-gray-100 text-gray-900 hover:bg-gray-200`}
                >
                  <Minus className="w-5 h-5" />
                </motion.button>

                <span
                  className={`text-2xl font-bold min-w-[40px] text-center text-gray-900`}
                >
                  {quantity}
                </span>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(quantity + 1)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-gray-100 text-gray-900 hover:bg-gray-200`}
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Total Price */}
            <div className="flex items-baseline gap-2">
              <span className={`text-sm text-gray-600`}>סה"כ:</span>
              <span className={`text-3xl font-bold text-teal-600`}>
                ₪{product.price * quantity}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mr-auto">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => handleAddToCart(product.id, quantity)}
                className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 text-base font-bold min-h-[44px] bg-gray-100 text-gray-900 hover:bg-gray-200`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>הוסף לעגלה</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleQuickPurchase}
                className="px-8 py-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all flex items-center gap-2 text-base font-bold min-h-[44px]"
              >
                <Sparkles className="w-5 h-5" />
                <span>רכישה מהירה</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Product Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`rounded-3xl shadow-lg p-6 sm:p-8 mb-8 bg-white`}
        >
          <h2 className={`text-2xl font-bold mb-6 text-gray-900`}>תיאור מלא</h2>
          <p className={`text-base sm:text-lg leading-relaxed text-gray-700`}>
            {product.longDescription}
          </p>
        </motion.div>

        {/* Quick Info Cards & Features - Side by Side */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Quick Info Cards - 1/4 width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4 lg:w-1/4"
          >
            <motion.button
              onClick={() => product.delivery && setShowDeliveryModal(true)}
              whileTap={{ scale: 0.98 }}
              className={`rounded-2xl shadow-lg p-6 flex items-start gap-4 transition-all ${
                product.delivery
                  ? "cursor-pointer hover:shadow-xl"
                  : "cursor-default"
              } bg-white`}
            >
              <div
                className={`p-3 rounded-xl ${
                  product.delivery
                    ? product.delivery.zones[0].cost === 0
                      ? "bg-teal-50"
                      : "bg-orange-50"
                    : "bg-gray-100"
                }`}
              >
                <Truck
                  className={`w-6 h-6 ${
                    product.delivery
                      ? product.delivery.zones[0].cost === 0
                        ? "text-teal-600"
                        : "text-orange-600"
                      : "text-gray-400"
                  }`}
                />
              </div>
              <div className="text-right flex-1">
                <p className={`text-sm mb-1 text-gray-600`}>משלוחים</p>
                <p className={`text-lg font-bold text-gray-900`}>
                  {product.delivery
                    ? product.delivery.zones[0].description
                    : "לא זמין"}
                </p>
              </div>
            </motion.button>

            <div
              className={`rounded-2xl shadow-lg p-6 flex items-start gap-4 bg-white`}
            >
              <div className={`p-3 rounded-xl bg-purple-50`}>
                <Users className={`w-6 h-6 text-purple-600`} />
              </div>
              <div>
                <p className={`text-sm mb-1 text-gray-600`}>עד היום נרכשו</p>
                <p className={`text-lg font-bold text-gray-900`}>
                  {product.groupSize}
                </p>
              </div>
            </div>

            <div
              className={`rounded-2xl shadow-lg p-6 flex items-start gap-4 bg-white`}
            >
              <div className={`p-3 rounded-xl bg-blue-50`}>
                <Calendar className={`w-6 h-6 text-blue-600`} />
              </div>
              <div>
                <p className={`text-sm mb-1 text-gray-600`}>זמינות</p>
                <p className={`text-base font-bold text-gray-900`}>
                  {product.availability}
                </p>
              </div>
            </div>
          </motion.div>

          {/* What's Included - 3/4 width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`rounded-3xl shadow-lg p-6 sm:p-8 lg:w-3/4 bg-white`}
          >
            <h2 className={`text-2xl font-bold mb-6 text-gray-900`}>
              מאפיינים
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {product.included.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-teal-50`}>
                    <Check className={`w-5 h-5 text-teal-600`} />
                  </div>
                  <span className={`text-base text-gray-700`}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-3xl shadow-lg p-6 sm:p-8 bg-white`}
          >
            <h2 className={`text-2xl font-bold mb-6 text-gray-900`}>
              מוצרים נוספים מ-
            </h2>

            <div
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {relatedProducts.map((relatedProduct) => (
                <motion.button
                  key={relatedProduct.id}
                  onClick={() =>
                    router.push(`/product-details/${relatedProduct.id}`)
                  }
                  whileTap={{ scale: 0.98 }}
                  className={`flex-shrink-0 w-[280px] sm:w-[300px] rounded-2xl overflow-hidden shadow-lg snap-start bg-white border border-gray-200`}
                >
                  <div className="relative h-48">
                    <img
                      src={relatedProduct.gallery[0]}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h3
                      className={`text-xl font-bold mb-2 line-clamp-2 text-right text-gray-900`}
                    >
                      {relatedProduct.name}
                    </h3>
                    <p
                      className={`text-sm mb-3 line-clamp-2 text-right text-gray-600`}
                    >
                      {relatedProduct.shortDescription}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className={`text-sm font-bold text-gray-900`}>
                          {relatedProduct.rating}
                        </span>
                      </div>
                      <p className={`text-xl font-bold text-teal-600`}>
                        ₪{relatedProduct.price}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
