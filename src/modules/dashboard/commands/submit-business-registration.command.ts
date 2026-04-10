export class SubmitBusinessRegistrationCommand {
  constructor(
    public readonly businessName: string,
    public readonly idNumber: string,
    public readonly businessDescription: string,
    public readonly address: string,
    public readonly landlinePhone: number,
    public readonly fax: string,
    public readonly email: string,
    public readonly contactName: string,
    public readonly contactPhone: number,
    public readonly isPrimaryIncome: boolean,
    public readonly categories: string[],
  ) {}
}
