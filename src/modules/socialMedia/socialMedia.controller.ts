import {
  Body,
  Controller, Delete, Get, HttpStatus, Param, Post, Put, Res,
} from '@nestjs/common';
import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { SocialMediaService } from './socialMedia.service';
import { Response } from 'express';
import { createSocialMediaDto } from './dto/createSocialMedia.dto';
import { responseHelper } from 'src/core/helper/response.helper';
import { updateSocialMediaDto } from './dto/updateSocialMedia.dto';

@Controller()
export class SocialMediaController {
  constructor(private readonly socialMediaService: SocialMediaService) { }

  @ApiEndpoint({
    tags: ['Admin', 'Social Media'],
    response: {
      status: 201,
      description: ServerSuccess.SOCIAL_MEDIA_CREATED,
    },
  })
  @Post('admin/social-media')
  async createSocialMedai(@Res() response: Response, @Body() dto: createSocialMediaDto) {
    await this.socialMediaService.findByFieldName('name', dto.name);
    const socialMedia = await this.socialMediaService.create(dto);
    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.SOCIAL_MEDIA_CREATED,
      socialMedia,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Social Media'],
    response: {
      status: 200,
      description: ServerSuccess.SOCIAL_MEDIA_LISTED,
    },
  })
  @Get('admin/social-media')
  async getSocialMedia(@Res() response: Response) {
    const socialMedia = await this.socialMediaService.getAll();
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.SOCIAL_MEDIA_LISTED,
      socialMedia,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Social Media'],
    response: {
      status: 200,
      description: ServerSuccess.SOCIAL_MEDIA_UPDTED,
    },
  })
  @Put('admin/social-media/:id')
  async updateSocialMedia(
      @Res() response: Response,
      @Param('id') id: string,
      @Body() dto: updateSocialMediaDto,
  ) {
    console.log(id);
    const socialMedia = await this.socialMediaService.update(id, dto);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.SOCIAL_MEDIA_UPDTED,
      socialMedia,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Social Media'],
    response: {
      status: 200,
      description: ServerSuccess.SOCIAL_MEDIA_UPDTED,
    },
  })
  @Delete('admin/social-media/:id')
  async deleteSocialMedai(
        @Res() response: Response,
      @Param('id') id: string,
  ) {
    const socialMedia = await this.socialMediaService.softDelete(id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.SOCIAL_MEDIA_UPDTED,
      socialMedia,
      null,
      null,
    );
  }
}
