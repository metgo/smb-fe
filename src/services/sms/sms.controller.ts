import {
  Body, Controller, HttpStatus, Post, Res,
} from '@nestjs/common';
import { Response } from 'express';

import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { SendSmsDto } from './dto/sms.dto';
import { SmsService } from './sms.service';
import { BirthdaySmsDto } from './dto/sms.birthday.dto';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @ApiEndpoint({
    tags: ['SMS'],
    response: {
      status: HttpStatus.OK,
      description: 'Purchase confirmation SMS sent successfully.',
    },
    softBlockExtraDtoFields: true,
  })
  @Post('confirmPurchase')
  async sendPurchaseConfirmationSms(
    @Body() body: SendSmsDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.smsService.sendConfirmPurchaseSms(body);

      if (result.success) {
        return responseHelper(
          res,
          HttpStatus.OK,
          'Purchase confirmation SMS sent successfully.',
          result.data,
          null,
          null,
        );
      }
      return responseHelper(
        res,
        HttpStatus.BAD_REQUEST,
        'Failed to send purchase confirmation SMS.',
        null,
        result.error,
        null,
      );
    } catch (error) {
      console.error('Error in sendPurchaseConfirmationSms:', error);
      return responseHelper(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
        null,
        error.message,
        null,
      );
    }
  }

  @ApiEndpoint({
    tags: ['SMS'],
    response: {
      status: HttpStatus.OK,
      description: 'Birthday gift SMS sent successfully.',
    },
    softBlockExtraDtoFields: true,
  })
  @Post('birthdayGift')
  async sendBirthdayGiftSms(
    @Body() body: BirthdaySmsDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.smsService.sendBirthdayGiftSms(body);

      if (result.success) {
        return responseHelper(
          res,
          HttpStatus.OK,
          'Birthday gift SMS sent successfully.',
          result.data,
          null,
          null,
        );
      }
      return responseHelper(
        res,
        HttpStatus.BAD_REQUEST,
        'Failed to send birthday gift SMS.',
        null,
        result.error,
        null,
      );
    } catch (error) {
      console.error('Error in sendBirthdayGiftSms:', error);
      return responseHelper(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
        null,
        error.message,
        null,
      );
    }
  }
}
