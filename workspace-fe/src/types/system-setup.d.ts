interface IDmoFormData {
  name: string;
  description: string;
  logoUrl: string;
}

interface IAuthorityFormData {
  name: string;
  description: string;
  logoUrl: string;
  dmoId: string;
}

interface IWebsiteFormData {
  name: string;
  description: string;
  dmoId: string;
  authorityId: string;
  identifierId: string;
  purpose: string;
}
