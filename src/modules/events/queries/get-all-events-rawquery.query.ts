export class GetAllEventsRawQuery {
  constructor(
    public readonly campCode: string,
    public readonly subCategoriesId: string | string[],
    public readonly groupTypesId: string | string[],
    public readonly accessibilitiesId: string | string[],
    public readonly search: string,
  ) {}
}
