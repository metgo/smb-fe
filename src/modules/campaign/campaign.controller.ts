/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { CampaignService } from './campaign.service';
import { ServerSuccess } from 'src/common/constant';
import { responseHelper } from 'src/core/helper/response.helper';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { FilterQuery } from './dto/query.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { DeleteMediaDTO } from './dto/delete-media.dto';
import { updateCampaignDto } from './dto/updateCampaign.dto';
import { UserType } from '../users/users.type';
import { fileFilterByExtensions } from 'src/services/gcp-bucket/middleware/file-filter';

@Controller()
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Roles(UserType.ADMIN, UserType.SUPERADMIN, UserType.DMO, UserType.DMOADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Campaign'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.CAMPAIGN_CREATED,
    },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @UseInterceptors(AnyFilesInterceptor({ fileFilter: fileFilterByExtensions }))
  @Post('admin/campaign')
  async create(
    @Body() dto: CreateCampaignDto,
    @Req() request,
    @Res() response: Response,
    @UploadedFiles() image: Array<Express.Multer.File>,
  ) {
    const campaign = await this.campaignService.create(
      dto,
      image,
      request.user.id,
    );

    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.CAMPAIGN_CREATED,
      campaign,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Campaign'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.CAMPAIGN_LISTED,
    },
    noAuthToken: true,
  })
  @Roles(
    UserType.ADMIN,
    UserType.AUTHORITY,
    UserType.DMO,
    UserType.DMOADMIN,
    UserType.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard)
  @Get('admin/campaign')
  async getAll(
    @Req() request,
    @Res() response: Response,
    @Query() query: FilterQuery,
  ) {
    const campaign = await this.campaignService.getAll(request.user, query);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.CAMPAIGN_LISTED,
      campaign,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Campaign'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.CAMPAIGN_LISTED,
    },
    noAuthToken: true,
    params: [{ name: 'id', type: 'string', required: true }],
  })
  @Roles(
    UserType.ADMIN,
    UserType.AUTHORITY,
    UserType.DMO,
    UserType.DMOADMIN,
    UserType.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard)
  @Get('admin/campaign/:id')
  async getOne(@Res() response: Response, @Param('id') id: string) {
    const campaign = await this.campaignService.getOne(id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.CAMPAIGN_LISTED,
      campaign,
      null,
      null,
    );
  }

  @Roles(
    UserType.ADMIN,
    UserType.AUTHORITY,
    UserType.DMO,
    UserType.DMOADMIN,
    UserType.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Campaign'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.CAMPAIGN_LISTED,
    },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @Get('admin/my-campaign')
  async getMy(
    @Req() request,
    @Res() response: Response,
    @Query() query: FilterQuery,
  ) {
    const user = request.user.id;
    query.dmoId && request.user?.dmo?.id;
    const campaign = await this.campaignService.getMy(query, user);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.CAMPAIGN_LISTED,
      campaign,
      null,
      null,
    );
  }

  @Roles(
    UserType.ADMIN,
    UserType.AUTHORITY,
    UserType.DMO,
    UserType.DMOADMIN,
    UserType.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Campaign'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.CAMPAIGN_UPDATED,
    },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @Patch('admin/campaign/:id')
  async update(
    @Res() response: Response,
    @Req() request,
    @Param('id') id: string,
    @Body() dto: updateCampaignDto,
  ) {
    const { user } = request;
    await this.campaignService.findByFieldNameExcludeId('name', dto.name, id);
    const campaign = await this.campaignService.update(id, dto, user);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.CAMPAIGN_UPDATED,
      campaign,
      null,
      null,
    );
  }

  @Roles(
    UserType.ADMIN,
    UserType.AUTHORITY,
    UserType.DMO,
    UserType.DMOADMIN,
    UserType.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Campaign'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.CAMPAIGN_UPDATED,
    },
    noAuthToken: true,
  })
  @Delete('admin/campaign/:id')
  async softDelete(@Res() response: Response, @Param('id') id: string) {
    const campaign = await this.campaignService.softDelete(id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.CAMPAIGN_UPDATED,
      campaign,
      null,
      null,
    );
  }

  @Roles(UserType.ADMIN, UserType.SUPERADMIN, UserType.DMO, UserType.DMOADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Campaign'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.MEDIA.UPLOADED,
    },
    params: [{ name: 'campaignId', type: 'string', required: true }],
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @UseInterceptors(AnyFilesInterceptor({ fileFilter: fileFilterByExtensions }))
  @Patch('admin/campaign-media/:campaignId')
  async uploadMedia(
    @Param('campaignId') campaignId: string,
    @Req() request,
    @Res() response: Response,
    @UploadedFiles() image: Array<Express.Multer.File>,
  ) {
    const campaign = await this.campaignService.addMedia(
      campaignId,
      image,
      request.user,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MEDIA.UPLOADED,
      campaign,
      null,
      null,
    );
  }

  @Roles(UserType.ADMIN, UserType.SUPERADMIN, UserType.DMO, UserType.DMOADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Campaign'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.MEDIA.DELETED,
    },
    params: [{ name: 'campaignId', type: 'string', required: true }],
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @Delete('admin/campaign-media/:campaignId')
  async deleteMedia(
    @Body() dto: DeleteMediaDTO,
    @Param('campaignId') campaignId: string,
    @Req() request,
    @Res() response: Response,
  ) {
    const campaign = await this.campaignService.deleteMedia(
      campaignId,
      dto,
      request.user,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MEDIA.DELETED,
      campaign,
      null,
      null,
    );
  }
}
