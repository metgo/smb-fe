interface Product {
  id: string;
  name: {
    en: string;
    he: string;
    ar: string;
  };
  shortDescription: {
    en: string;
    he: string;
    ar: string;
  };
  businessId: string;
  businessName: string;
  type: 'physical' | 'table-order' | 'service' | 'hotel-room' | 'experience';
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';
  markedPrice: number;
  sellingPrice: number;
  quantity: number | null; // null = unlimited
  soldCount: number;
  availability: {
    startDate: string | null;
    endDate: string | null;
  };
  categories: string[];
  image: string | null;
  lastUpdated: string;
  languageCompleteness: {
    en: boolean;
    he: boolean;
    ar: boolean;
  };
}