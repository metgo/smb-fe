export class GetPunchPassByIdQuery {
  constructor(
    public readonly id: string,
    public readonly checkout?: boolean,
  ) {}
}
