export class GetAllProductsRawQuery {
  constructor(
    public readonly campCode: string,
    public readonly businessId: string | string[],
    public readonly categoriesId: string | string[],
    public readonly subCategoriesId: string | string[],
    public readonly groupTypesId: string | string[],
    public readonly accessibilitiesId: string | string[],
    public readonly priceMin: number,
    public readonly priceMax: number,
    public readonly search: string,
    public readonly vendorDelivers: boolean,
  ) {}
}
