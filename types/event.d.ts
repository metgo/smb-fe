interface IDayDescription {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface ITicketPrice {
  _id: string;
  markedPrice: number;
  sellingPrice: number;
  discountAmount: number;
  discountPercent: number;
}
interface ITicketQuantity {
  _id: string;
  initial: number;
  sold: number;
  remaining: number;
  perUserLimit: number;
  isUnlimited: boolean;
}

interface ITicketIds {
  _id: string;
  name: string;
  images: ImageItem[];
  userId: string;
  price: ITicketPrice;
  quantity: ITicketQuantity;
  status: string;
  type: string;
  description: string;
  dayDescription: IDayDescription[];
}

interface GroupedTicketSlot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  tickets: {
    _id: string;
    name: string;
    images: ImageItem[];
    userId: string;
    price: ITicketPrice;
    quantity: ITicketQuantity;
    status: string;
    type: string;
    description: string;
  }[];
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
  externalLink: string;
  ticketIds: ITicketIds[];
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

interface EventListProps {
  _id: string;
  name: string;
  address: {
    country: string;
    city: string;
    location: string;
    _id: string;
  };
  description: string;
  geoLocation: GeoLocation;
  images: ImageItem[];
  cover: ImageItem;
  slug: string;
}

interface EventListResponseProps {
  data: EventListProps;
  totalData: number;
  meta: PaginationMeta;
}
