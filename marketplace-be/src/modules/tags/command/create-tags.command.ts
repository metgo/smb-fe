import { ObjectId } from 'typeorm';

export class CreateTagCommand {
  constructor(
    public readonly name: string,
    public readonly nameHe?: string,
    public readonly nameAr?: string,
    public readonly subcategoryId?: ObjectId,
    public readonly icon?: string,
  ) {}
}
