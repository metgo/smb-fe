import {
  Controller, HttpCode, HttpStatus, Post, Body,
} from '@nestjs/common';

import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { ServerSuccess } from 'src/common/constant';
import { GoogleSheetsService } from 'src/services/google-sheets/google-sheets.service';
import { ContactUsRequest } from './requests/contact-us.request';
import { ConfigService } from 'src/services/config/config.service';

@Controller()
export class ContactUsController {
  constructor(
    private readonly googleSheetsService: GoogleSheetsService,
    private readonly configService: ConfigService,
  ) {}

  @ApiEndpoint({
    tags: ['Contact-Us'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.CONTACT_US_EMAIL,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('contact-us')
  async contactUs(@Body() body: ContactUsRequest) {
    const { websiteIdentity, ...contents } = body;

    await this.googleSheetsService.appendRow(
      this.configService.get('GOOGLE_SHEET_CONTACT_US'),
      websiteIdentity,
      [...Object.values(contents), new Date().toISOString()],
    );

    return { message: ServerSuccess.CONTACT_US_EMAIL };
  }
}
