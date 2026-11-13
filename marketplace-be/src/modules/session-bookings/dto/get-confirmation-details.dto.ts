import { IsNotEmpty, IsString } from 'class-validator';

export class GetConfirmationDetailsDto {
  @IsString()
  @IsNotEmpty()
    bookingId: string;
}
