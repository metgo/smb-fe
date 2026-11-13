import { ObjectId } from 'typeorm';

export class GetEventByIdsQuery {
  constructor(public readonly ids: ObjectId[]) {}
}
