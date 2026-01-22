export interface TimeRange {
  open: string;
  close: string;
}

export interface OperatingHours {
  sunday: TimeRange[];
  monday: TimeRange[];
  tuesday: TimeRange[];
  wednesday: TimeRange[];
  thursday: TimeRange[];
  friday: TimeRange[];
  saturday: TimeRange[];
}

export interface OpeningHrPayload {
  days: string;
  open: string;
  close: string;
  isHoliday: boolean;
}
