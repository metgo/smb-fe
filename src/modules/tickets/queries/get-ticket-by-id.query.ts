export class GetTicketByIdQuery {
  constructor(
    public readonly id: string,
    public readonly checkout?: boolean,
  ) {}
}
