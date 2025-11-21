export interface GetPOIRawQueryDto {
  campDetails?: any;
  search?: string;
}

export class GetPOIRawQuery {
  constructor(readonly body: GetPOIRawQueryDto) {}
}
