/* eslint-disable no-undef */
/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */
import {
  Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { createCampaignDto } from './dto/createCampaign.dto';
import { Response } from 'express';
import { CampaignService } from './campaign.service';
import { ServerSuccess } from 'src/common/constant';
import { responseHelper } from 'src/core/helper/response.helper';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { UserType } from '../users/users.type';
import { FilterQuery } from './dto/query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilterByExtensions } from 'src/services/gcp-bucket/middleware/file-filter';
import { updateCampaignDto } from './dto/updateCampaign.dto';

@Controller()
export class CampaignController {
  constructor(
      private readonly campaignService: CampaignService,
  ) { }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin, Campaign'],
    response: { status: 201, description: ServerSuccess.CAMPAIGN_CREATED },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @Post('admin/create-campaign')
  async createCampaign(
        @Body() dto: createCampaignDto,
        @Req() request,
        @Res() response: Response,
  ) {
    const user = request.user.id;
    dto.name && await this.campaignService.findByFieldName('name', dto.name);
    dto.code && await this.campaignService.findByFieldName('code', dto.code);

    const campaign = await this.campaignService.createCampaign(dto, user);
    return responseHelper(response, HttpStatus.CREATED, ServerSuccess.CAMPAIGN_CREATED, campaign, null, null);
  }

  @ApiEndpoint({
    tags: ['Admin, Campaign'],
    response: {
      status: 200,
      description: ServerSuccess.CAMPAIGN_LISTED,
    },
  })
  @Get('get-campaign')
  async getAllCampaign(@Res() response: Response, @Query() query:FilterQuery) {
    const campaign = await this.campaignService.getAllCampaign(query);
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
    tags: ['Admin, Campaign'],
    response: {
      status: 200,
      description: ServerSuccess.CAMPAIGN_LISTED,
    },
  })
  @Get('get-campaign/:id')
  async getCampaign(@Res() response: Response, @Param('id') id: string) {
    const campaign = await this.campaignService.getCampaign(id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.CAMPAIGN_LISTED,
      campaign,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Campaign'],
    response: {
      status: 200,
      description: ServerSuccess.CAMPAIGN_UPDATED,
    },
  })
  @UseInterceptors(FileInterceptor('newImage', { fileFilter: fileFilterByExtensions }))
  @Put('update-campaign/:id')
  async updateCampaign(
      @Res() response: Response,
      @Param('id') id: string,
      @Body() dto: updateCampaignDto,
      @UploadedFile() newImage: Express.Multer.File,
  ) {
    await this.campaignService.findByFieldNameExcludeId('name', dto.name, id);
    const campaign = await this.campaignService.updateCampaign(id, dto, newImage);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.CAMPAIGN_UPDATED,
      campaign,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Campaign'],
    response: {
      status: 200,
      description: ServerSuccess.CAMPAIGN_UPDATED,
    },
  })
  @Delete('delete-campaign/:id')
  async softDeleteCampaign(@Res() response: Response, @Param('id') id: string) {
    const campaign = await this.campaignService.softDeleteCampaign(id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.CAMPAIGN_UPDATED,
      campaign,
      null,
      null,
    );
  }
}
