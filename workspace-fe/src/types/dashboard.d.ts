interface IUpcommingEvent {
  _id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  nameHe: string;
  nameAr: string;
  slug: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  upcomingDate: string;
  image: string | null;
  address: {
    country: string;
    city: string;
    location: string;
    additional_information: string;
  };
}

interface IUpcommingEventsResponse {
  data: IUpcommingEvent[];
}
