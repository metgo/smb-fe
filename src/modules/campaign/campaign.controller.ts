/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */
import {
  Body, Controller, HttpStatus, Post, Req, Res, UseGuards,
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

@Controller()
export class CampaignController {
  constructor(
      private readonly campaignService: CampaignService,
  ) { }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Campign Admin '],
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
}
