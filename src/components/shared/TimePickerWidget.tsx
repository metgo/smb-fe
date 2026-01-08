import { Clock, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface TimePickerWidgetProps {
  value: string; // Format: "HH:MM"
  onChange: (value: string) => void;
  theme: Theme;
  isRTL?: boolean;
}

export function TimePickerWidget({ value, onChange, theme, isRTL }: TimePickerWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);

  // Parse the value prop
  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':');
      setSelectedHour(hour || '09');
      setSelectedMinute(minute || '00');
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Scroll to selected values when opening
  useEffect(() => {
    if (isOpen && hourScrollRef.current && minuteScrollRef.current) {
      const hourIndex = parseInt(selectedHour);
      const minuteIndex = ['00', '15', '30', '45'].indexOf(selectedMinute);
      
      setTimeout(() => {
        if (hourScrollRef.current) {
          hourScrollRef.current.scrollTop = hourIndex * 48 - 96; // 48px per item, center it
        }
        if (minuteScrollRef.current) {
          minuteScrollRef.current.scrollTop = minuteIndex * 48 - 96;
        }
      }, 10);
    }
  }, [isOpen, selectedHour, selectedMinute]);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour);
    onChange(`${hour}:${selectedMinute}`);
  };

  const handleMinuteSelect = (minute: string) => {
    setSelectedMinute(minute);
    onChange(`${selectedHour}:${minute}`);
  };

  const handleConfirm = () => {
    onChange(`${selectedHour}:${selectedMinute}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2.5 rounded-xl border-2 flex items-center justify-between transition-all duration-200 ${
          isOpen
            ? 'border-teal-500 shadow-lg shadow-teal-500/20'
            : theme === 'dark'
            ? 'bg-gray-800 border-gray-700 text-gray-200 hover:border-gray-600'
            : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
        } focus:outline-none focus:ring-2 focus:ring-teal-500/50`}
      >
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isOpen ? 'text-teal-500' : 'text-gray-400'}`} />
          <span className="font-mono text-lg">{selectedHour}:{selectedMinute}</span>
        </div>
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div
          className={`absolute top-full mt-2 w-72 rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-200 ${
            isRTL ? 'right-0' : 'left-0'
          } ${
            theme === 'dark'
              ? 'bg-gray-900 border border-gray-800'
              : 'bg-white border border-gray-200'
          }`}
          style={{
            animation: 'slideDown 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div className={`px-4 py-3 border-b ${
            theme === 'dark' ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-500" />
                <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  Select Time
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Time Display */}
          <div className={`px-6 py-6 text-center border-b ${
            theme === 'dark' ? 'bg-gradient-to-br from-teal-900/20 to-purple-900/20 border-gray-800' : 'bg-gradient-to-br from-teal-50 to-purple-50 border-gray-200'
          }`}>
            <div className="text-5xl font-bold tracking-wider font-mono bg-gradient-to-r from-teal-500 to-purple-500 bg-clip-text text-transparent">
              {selectedHour}:{selectedMinute}
            </div>
          </div>

          {/* Wheel Pickers */}
          <div className="flex divide-x divide-gray-700 relative">
            {/* Hour Wheel */}
            <div className="flex-1 relative">
              <div className={`text-xs text-center py-2 font-medium ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Hour
              </div>
              <div className="relative h-48 overflow-hidden">
                {/* Selection indicator */}
                <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-12 border-y-2 border-teal-500 pointer-events-none z-10 ${
                  theme === 'dark' ? 'bg-teal-500/5' : 'bg-teal-500/10'
                }`} />
                
                {/* Gradient overlays */}
                <div className={`absolute top-0 left-0 right-0 h-20 pointer-events-none z-20 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-b from-gray-900 via-gray-900/50 to-transparent'
                    : 'bg-gradient-to-b from-white via-white/50 to-transparent'
                }`} />
                <div className={`absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-20 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent'
                    : 'bg-gradient-to-t from-white via-white/50 to-transparent'
                }`} />

                <div 
                  ref={hourScrollRef}
                  className="h-full overflow-y-auto scrollbar-hide py-20"
                  style={{ scrollSnapType: 'y mandatory' }}
                >
                  {hours.map((hour) => {
                    const isSelected = selectedHour === hour;
                    return (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => handleHourSelect(hour)}
                        className={`w-full h-12 flex items-center justify-center transition-all duration-200 font-mono text-lg ${
                          isSelected
                            ? 'text-teal-500 scale-110'
                            : theme === 'dark'
                            ? 'text-gray-500 hover:text-gray-300'
                            : 'text-gray-400 hover:text-gray-700'
                        }`}
                        style={{ scrollSnapAlign: 'center' }}
                      >
                        {hour}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Minute Wheel */}
            <div className="flex-1 relative">
              <div className={`text-xs text-center py-2 font-medium ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Minute
              </div>
              <div className="relative h-48 overflow-hidden">
                {/* Selection indicator */}
                <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-12 border-y-2 border-purple-500 pointer-events-none z-10 ${
                  theme === 'dark' ? 'bg-purple-500/5' : 'bg-purple-500/10'
                }`} />
                
                {/* Gradient overlays */}
                <div className={`absolute top-0 left-0 right-0 h-20 pointer-events-none z-20 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-b from-gray-900 via-gray-900/50 to-transparent'
                    : 'bg-gradient-to-b from-white via-white/50 to-transparent'
                }`} />
                <div className={`absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-20 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent'
                    : 'bg-gradient-to-t from-white via-white/50 to-transparent'
                }`} />

                <div 
                  ref={minuteScrollRef}
                  className="h-full overflow-y-auto scrollbar-hide py-20"
                  style={{ scrollSnapType: 'y mandatory' }}
                >
                  {minutes.map((minute) => {
                    const isSelected = selectedMinute === minute;
                    return (
                      <button
                        key={minute}
                        type="button"
                        onClick={() => handleMinuteSelect(minute)}
                        className={`w-full h-12 flex items-center justify-center transition-all duration-200 font-mono text-lg ${
                          isSelected
                            ? 'text-purple-500 scale-110'
                            : theme === 'dark'
                            ? 'text-gray-500 hover:text-gray-300'
                            : 'text-gray-400 hover:text-gray-700'
                        }`}
                        style={{ scrollSnapAlign: 'center' }}
                      >
                        {minute}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`px-4 py-3 border-t ${
            theme === 'dark' ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50 border-gray-200'
          }`}>
            <button
              onClick={handleConfirm}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}