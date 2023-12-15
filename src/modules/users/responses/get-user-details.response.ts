import { ApiProperty } from '@nestjs/swagger';
import { UserType, phoneDetails } from 'src/modules/users/users.type';

export class GetUserDetailsResponse {
  @ApiProperty()
    id: string;

  @ApiProperty()
    fullName: string;

  @ApiProperty()
    phoneDetails: phoneDetails;

  @ApiProperty()
    address: string;

  @ApiProperty()
    dob: Date;

  @ApiProperty()
    email: string;

  @ApiProperty()
    lastLogin?: Date;

  @ApiProperty()
    isPhoneVerify: boolean;

  @ApiProperty()
    isEmailVerify: boolean;

  @ApiProperty()
    loginAttempts?: number;

  @ApiProperty()
    role: UserType;

  @ApiProperty()
    hasBusiness?: boolean;

  @ApiProperty()
    createdAt: Date;

  @ApiProperty()
    updatedAt: Date;

  @ApiProperty()
    deletedAt?: Date;
}
