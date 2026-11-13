interface TimeRange {
  open: string;
  close: string;
}

interface OperatingHours {
  sunday: TimeRange[];
  monday: TimeRange[];
  tuesday: TimeRange[];
  wednesday: TimeRange[];
  thursday: TimeRange[];
  friday: TimeRange[];
  saturday: TimeRange[];
}

interface OpeningHrPayload {
  days: string;
  open: string;
  close: string;
  isHoliday: boolean;
  byAppointment: boolean;
}
