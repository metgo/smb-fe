export interface GetEventRawQueryDto {
  campDetails?: any;
  search?: string;
}

export class GetEventRawQuery {
  constructor(readonly body: GetEventRawQueryDto) {}
}
