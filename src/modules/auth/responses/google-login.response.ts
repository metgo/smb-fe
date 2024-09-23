import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginResponse {
  @ApiProperty()
  readonly accessToken: string;

  @ApiProperty()
  readonly refreshToken: string;
}
