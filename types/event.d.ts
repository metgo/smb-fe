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
  _id: string;
  method: string;
  isFree: boolean;
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

interface UpdatedTicketItem {
  quantity: number;
  _id: string;
  name: string;
  desc: string;
  isSelected: boolean;
  image: string;
  price: number;
}

interface UpdatedTicketsListProps {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  tickets: UpdatedTicketItem[];
}
