import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X } from 'lucide-react';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (address: string, placeData?: any) => void;
  placeholder?: string;
  theme: Theme;
  error?: string;
}

// Mock Google Places data for demonstration (Western Negev cities)
const MOCK_PLACES = [
  { description: 'Beer Sheva, Israel', placeId: '1', mainText: 'Beer Sheva', secondaryText: 'Israel' },
  { description: 'Sderot, Israel', placeId: '2', mainText: 'Sderot', secondaryText: 'Israel' },
  { description: 'Netivot, Israel', placeId: '3', mainText: 'Netivot', secondaryText: 'Israel' },
  { description: 'Ofakim, Israel', placeId: '4', mainText: 'Ofakim', secondaryText: 'Israel' },
  { description: 'Ashkelon, Israel', placeId: '5', mainText: 'Ashkelon', secondaryText: 'Israel' },
  { description: 'Kiryat Gat, Israel', placeId: '6', mainText: 'Kiryat Gat', secondaryText: 'Israel' },
  { description: 'Rahat, Israel', placeId: '7', mainText: 'Rahat', secondaryText: 'Israel' },
  { description: 'Dimona, Israel', placeId: '8', mainText: 'Dimona', secondaryText: 'Israel' },
  { description: 'Arad, Israel', placeId: '9', mainText: 'Arad', secondaryText: 'Israel' },
  { description: 'Yeruham, Israel', placeId: '10', mainText: 'Yeruham', secondaryText: 'Israel' },
  { description: 'Mitzpe Ramon, Israel', placeId: '11', mainText: 'Mitzpe Ramon', secondaryText: 'Israel' },
  { description: 'Kiryat Malachi, Israel', placeId: '12', mainText: 'Kiryat Malachi', secondaryText: 'Israel' },
  { description: 'Eshkol Regional Council, Israel', placeId: '13', mainText: 'Eshkol Regional Council', secondaryText: 'Western Negev, Israel' },
  { description: 'Sha\'ar HaNegev Regional Council, Israel', placeId: '14', mainText: 'Sha\'ar HaNegev', secondaryText: 'Western Negev, Israel' },
  { description: 'Sdot Negev Regional Council, Israel', placeId: '15', mainText: 'Sdot Negev', secondaryText: 'Western Negev, Israel' },
];

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  placeholder = 'Search for a location',
  theme,
  error
}: GooglePlacesAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const inputClasses = theme === 'dark'
    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';

  const textSecondary = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const textTertiary = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  // Sync query with value prop
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Handle search query changes
  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      // Use mock data for demo
      const filtered = MOCK_PLACES.filter(place =>
        place.description.toLowerCase().includes(query.toLowerCase()) ||
        place.mainText.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (suggestion: any) => {
    const address = suggestion.description;
    setQuery(address);
    onChange(address, suggestion);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search className={`w-5 h-5 ${textTertiary}`} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
          }}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            // Delay to allow click on suggestions
            setTimeout(() => setIsOpen(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2 rounded-lg border ${inputClasses} ${
            error ? 'border-red-500' : ''
          }`}
        />
        {query && (
          <button
            onClick={handleClear}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${textTertiary} hover:text-red-500 transition-colors`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          className={`absolute z-50 w-full mt-1 rounded-lg border shadow-lg max-h-60 overflow-y-auto ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.placeId}
              onClick={() => handleSelect(suggestion)}
              className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                index === selectedIndex
                  ? theme === 'dark'
                    ? 'bg-gray-700'
                    : 'bg-gray-100'
                  : theme === 'dark'
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-50'
              } ${index > 0 ? (theme === 'dark' ? 'border-t border-gray-700' : 'border-t border-gray-100') : ''}`}
            >
              <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${textTertiary}`} />
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${textSecondary}`}>
                  {suggestion.mainText}
                </div>
                {suggestion.secondaryText && (
                  <div className={`text-xs ${textTertiary} mt-0.5`}>
                    {suggestion.secondaryText}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Info message */}
      <p className={`text-xs mt-1 ${textTertiary} flex items-center gap-1`}>
        <MapPin className="w-3 h-3" />
        Search for cities in the Western Negev region
      </p>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}
