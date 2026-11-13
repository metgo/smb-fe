import { misc } from "@/constant/hebrew";
import { useEffect, useState } from "react";
import {
  FaFacebookF,
  FaFacebookMessenger,
  FaInstagram,
  FaLinkedinIn,
  FaPinterest,
  // FaEnvelope,
  FaReddit,
  FaTelegram,
  FaTimes,
  FaWhatsapp,
} from "react-icons/fa";
import { FaLink, FaXTwitter } from "react-icons/fa6";
import { IoIosShareAlt } from "react-icons/io";

interface ShareModalProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  trailInfo?: string;
  url?: string;
  title?: string;
}

export default function MobileLinkShareBottomDrawer({
  isOpen,
  setIsOpen,
  trailInfo,
  url = typeof window !== "undefined" ? window.location.href : "",
  title = typeof window !== "undefined" ? document.title : "",
}: ShareModalProps) {
  // const [isCopied, setIsCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [fullUrl, setFullUrl] = useState(url);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (trailInfo) {
      const upadatedUrl = url + trailInfo;
      setFullUrl(upadatedUrl);
    }
  }, [trailInfo]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  if (!isOpen) return null;

  // const copyToClipboard = async () => {
  //   try {
  //     await navigator.clipboard.writeText(url);
  //     setIsCopied(true);
  //     setTimeout(() => setIsCopied(false), 2000);
  //   } catch (err) {
  //     console.error('Failed to copy: ', err);
  //   }
  // };

  const sharePlatforms = [
    {
      name: "פייסבוק",
      icon: FaFacebookF,
      color: "bg-[#1877F2]",
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    },
    {
      name: "X (טוויטר)",
      icon: FaXTwitter,
      color: "bg-black",
      shareUrl: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
    },
    {
      name: "לינקדאין",
      icon: FaLinkedinIn,
      color: "bg-[#0A66C2]",
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
    },
    {
      name: "וואטסאפ",
      icon: FaWhatsapp,
      color: "bg-[#25D366]",
      shareUrl: `https://wa.me/?text=${encodeURIComponent(title + " " + fullUrl)}`,
    },
    {
      name: "טלגרם",
      icon: FaTelegram,
      color: "bg-[#0088CC]",
      shareUrl: `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
    },
    // {
    //   name: 'אימייל',
    //   icon: FaEnvelope,
    //   color: 'bg-[#EA4335]',
    //   shareUrl: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
    // },
    {
      name: "רדיט",
      icon: FaReddit,
      color: "bg-[#FF4500]",
      shareUrl: `https://reddit.com/submit?url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(title)}`,
    },
    {
      name: "פינטרסט",
      icon: FaPinterest,
      color: "bg-[#E60023]",
      shareUrl: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(fullUrl)}&description=${encodeURIComponent(title)}`,
    },
    {
      name: "אינסטגרם",
      icon: FaInstagram,
      color: "bg-[#E1306C]",
      // Instagram doesn't support direct share URLs for links.
      shareUrl: `https://www.instagram.com/`,
    },
    {
      name: "מסנג׳ר",
      icon: FaFacebookMessenger,
      color: "bg-[#0084FF]",
      shareUrl: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(fullUrl)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(url)}`,
    },
  ];

  const handleShare = (shareUrl: string) => {
    window.open(shareUrl, "_blank", "width=600,height=400");
    handleClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 max-sm:block md:hidden ${
          isVisible ? "bg-opacity-50" : "bg-opacity-0"
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClose();
        }}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg bg-white rounded-t-2xl shadow-lg transform transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <IoIosShareAlt className="h-6 w-6 text-black" />
            <h2 className="text-xl font-bold text-gray-900">{misc.share}</h2>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors duration-200"
          >
            <FaTimes className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Share Link Section */}
        <div className="px-2 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between bg-gray-50 rounded-xl py-4 px-2 border border-gray-200">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FaLink className="h-4 w-4 text-blue-600 flex-shrink-0" />
              </div>
              <p className="text-sm text-gray-600 flex-1 font-normal truncate">
                {fullUrl}
              </p>
            </div>
            {/* <button
              onClick={copyToClipboard}
              className={`ml-1 px-4 py-2 text-sm font-normal rounded-lg transition-all duration-600 flex-shrink-0 custom-cursor ${
                isCopied 
                  ? 'bg-black text-white' 
                  : 'border text-black'
              }`}
            >
              {isCopied ? misc.copied : misc.copy}
            </button> */}
          </div>
        </div>

        {/* Social Media Platforms */}
        <div className="px-6 py-4">
          <h3 className="text-sm font-bold text-theme mb-6 uppercase tracking-wide">
            {misc.shareToSocialMedia}
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {sharePlatforms.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <button
                  key={platform.name}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShare(platform.shareUrl);
                  }}
                  className=" custom-cursor flex flex-col items-center space-y-3 px-4 py-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 active:scale-95"
                >
                  <div
                    className={`${platform.color} p-4 rounded-full text-white hover:shadow-xl transition-shadow duration-200`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {platform.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Safe area for mobile devices */}
        <div className="pb-safe-bottom bg-white rounded-b-2xl" />
      </div>

      {/* Add safe area CSS */}
      <style jsx>{`
        .pb-safe-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
}
