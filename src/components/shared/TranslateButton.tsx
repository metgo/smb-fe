import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "iw", label: "Hebrew", flag: "🇮🇱" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
];

const PAGE_LANGUAGE = "ne";

function getCookieLang(): string | null {
  const match = document.cookie.match(/googtrans=\/[a-z-]+\/([a-z-]+)/);
  return match ? match[1] : null;
}

function triggerGoogleTranslate(langCode: string) {
  // Google Translate reads the /googtrans cookie on load
  const value = `/${PAGE_LANGUAGE}/${langCode}`;
  document.cookie = `googtrans=${value}; path=/`;
  document.cookie = `googtrans=${value}; domain=${location.hostname}; path=/`;
  location.reload();
}

export default function TranslateButton() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>(
    getCookieLang() ?? PAGE_LANGUAGE,
  );
  const ref = useRef<HTMLDivElement>(null);

  // Load the Google Translate script once (still needed to initialise the engine)
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: PAGE_LANGUAGE,
          includedLanguages: LANGUAGES.map((l) => l.code).join(","),
          autoDisplay: false,
        },
        "google_translate_element",
      );
    };

    const scriptId = "google-translate-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectLanguage(code: string) {
    setSelected(code);
    setOpen(false);
    if (code === PAGE_LANGUAGE) {
      // Clear translation cookie to restore original
      document.cookie =
        "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
      location.reload();
    } else {
      triggerGoogleTranslate(code);
    }
  }

  // Hidden element still required by the Google Translate API
  return (
    <>
      <div id="google_translate_element" className="hidden" />

      <div ref={ref} className="relative">
        {open && (
          <div className="absolute bottom-12 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[160px]">
            <p className="px-3.5 pt-2.5 pb-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100">
              Translate page
            </p>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => selectLanguage(lang.code)}
                className={`flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                  selected === lang.code
                    ? "text-blue-600 font-medium"
                    : "text-gray-700"
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          className={`w-10 h-10 rounded-full border flex items-center justify-center text-lg transition-colors ${
            open
              ? "bg-blue-50 border-blue-300"
              : "bg-white border-gray-200 hover:bg-gray-50"
          }`}
          title="Translate"
          aria-label="Open language selector"
        >
          🌐
        </button>
      </div>
    </>
  );
}
