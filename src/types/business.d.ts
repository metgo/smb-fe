 interface Business {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  email: string;
  phone: string;
  website: string;
  logo: string;
  images: string[];
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';
  authority: string;
  dmo: string;
  categories: string[];
  subcategories: string[];
  tags: string[];
  impactScore: number;
  productsCount: number;
  lifetimeSales: number; // Total sales revenue in ILS
  address: string;
  coordinates: { lat: number; lng: number };
  contactPerson: {
    name: string;
    email: string;
    phone: string;
  };
  operatingHours: {
    [key: string]: { open: string; close: string }[];
  };
  accessibility: string[];
  groupTypes: string[];
  createdAt: string;
  updatedAt: string;
  completionPercentage: number;
  internalNotes?: string;
  rejectionNote?: string;
}
