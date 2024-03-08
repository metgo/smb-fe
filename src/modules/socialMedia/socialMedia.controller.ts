import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { SocialMediaService } from './socialMedia.service';
import { createSocialMediaDto } from './dto/createSocialMedia.dto';
import { updateSocialMediaDto } from './dto/updateSocialMedia.dto';
import { FilterQuery } from './dto/query.dto';
import { UserType } from '../users/users.type';

@Controller('admin/social-media')
export class SocialMediaController {
  constructor(private readonly socialMediaService: SocialMediaService) {}

  @ApiEndpoint({
    tags: ['Admin', 'Social Media'],
    response: {
      status: 201,
      description: ServerSuccess.SOCIAL_MEDIA_CREATED,
    },
    noAuthToken: true,
  })
  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Post()
  async createSocialMedia(
    @Res() response: Response,
    @Body() dto: createSocialMediaDto,
  ) {
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

  @ApiEndpoint({
    tags: ['Admin', 'Social Media'],
    response: {
      status: 200,
      description: ServerSuccess.SOCIAL_MEDIA_UPDTED,
    },
    noAuthToken: true,
  })
  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async updateSocialMedia(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() dto: updateSocialMediaDto,
  ) {
    await this.socialMediaService.findByFieldNameExcludeId(
      'name',
      dto.name,
      id,
    );
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
    noAuthToken: true,
  })
  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteSocialMedai(@Res() response: Response, @Param('id') id: string) {
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
