interface TicketIds {
  _id: string;
  name: string;
  images: ImageItem[];
  userId: string;
  price: {
    _id: string;
    markedPrice: number;
    sellingPrice: number;
  };
  status: string;
}

declare interface DayDescription {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  ticketIds: TicketIds[];
}

interface Payment {
  ticketIds: string[];
}

declare interface EventDetailsProps {
  _id: string;
  name: string;
  slug: string;
  address: Address;
  description: string;
  dmoId: string;
  geoLocation: GeoLocation;
  images: ImageItem[];
  groupTypesId: Attributes[];
  accessibilitiesId: Attributes[];
  subCategoriesId: string[];
  cover: LogoCover;
  payment: Payment;
  dayDescription: DayDescription[];
}
