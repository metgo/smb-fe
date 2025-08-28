export class GetAllTripsRawQuery {
  constructor(
    public readonly campCode: string,
    public readonly categoriesId: string | string[],
    public readonly subCategoriesId: string | string[],
    public readonly groupTypesId: string | string[],
    public readonly accessibilitiesId: string | string[],
    public readonly search: string,
  ) {}
}
