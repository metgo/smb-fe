import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { ServerSuccess } from 'src/common/constant';
import { GenerateProfileRequest } from './requests/generate-profile.request';
import { ResolveAuthorityRequest } from './requests/resolve-authority.request';
import { VendorOnboardingService } from './vendor-onboarding.service';

@Controller('vendor-onboarding')
export class VendorOnboardingController {
  constructor(private readonly service: VendorOnboardingService) {}

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Vendor onboarding'],
    response: { status: HttpStatus.OK, description: ServerSuccess.LISTED },
    operation: 'Generate a business profile (wizard fields) from onboarding answers',
  })
  @HttpCode(HttpStatus.OK)
  @Post('generate-profile')
  async generateProfile(@Body() body: GenerateProfileRequest) {
    return this.service.generateProfile(body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Vendor onboarding'],
    response: { status: HttpStatus.OK, description: ServerSuccess.LISTED },
    operation: 'Find the authority and DMO that cover an address',
  })
  @HttpCode(HttpStatus.OK)
  @Get('resolve-authority')
  async resolveAuthority(@Query() query: ResolveAuthorityRequest) {
    return this.service.resolveAuthority(query);
  }
}
