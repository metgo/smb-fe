import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { GetAllApprovedBusinessesRequest } from '../../tourism/request/get-all-approved-businesses.request';

export class GetAllUnpaginatedBusinessQuery extends GetAllApprovedBusinessesRequest {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
    authorityId: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
    dmoId: string;
}
