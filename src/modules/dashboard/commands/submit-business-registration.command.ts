export interface ProductItem {
  service: string;
  cashPrice: string;
  onlinePrice: string;
  voucherPrice: string;
}

export class SubmitBusinessRegistrationCommand {
  constructor(
    public readonly businessName: string,
    public readonly idNumber: string,
    public readonly businessDescription: string,
    public readonly cluster: string,
    public readonly address: string,
    public readonly email: string,
    public readonly contactName: string,
    public readonly contactPhone: string,
    public readonly isPrimaryIncome: boolean,
    public readonly categories: string[],
    public readonly marketingDescription: string,
    public readonly targetAudience: string[],
    public readonly operatingHours: string,
    public readonly hasImmediateAvailability: boolean,
    public readonly interestedInOnlineSales: boolean,
    public readonly revenueImpact: string,
    public readonly revenueImpactOther: string,
    public readonly declarationReadDocs: boolean,
    public readonly declarationNoRestrictions: boolean,
    public readonly declarationHasPermits: boolean,
    public readonly declarationHasFirstAid: boolean,
    public readonly declarationNoLegalProceedings: boolean,
    public readonly declarationTaxCompliant: boolean,
    public readonly declarationAcceptsTerms: boolean,
    public readonly products: ProductItem[],
  ) {}
}
