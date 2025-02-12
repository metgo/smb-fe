import {
  Controller, Get, HttpStatus, Query, Res,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { SocialMediaService } from './socialMedia.service';
import { FilterQuery } from './dto/query.dto';

@Controller('admin/social-media')
export class SocialMediaController {
  constructor(private readonly socialMediaService: SocialMediaService) {}

  @ApiEndpoint({
    tags: ['Social Media'],
    response: {
      status: 200,
      description: ServerSuccess.SOCIAL_MEDIA_LISTED,
    },
  })
  @Get()
  async getSocialMedia(@Res() response: Response, @Query() query: FilterQuery) {
    const socialMedia = await this.socialMediaService.getAll(query);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.SOCIAL_MEDIA_LISTED,
      socialMedia,
      null,
      null,
    );
  }
}
