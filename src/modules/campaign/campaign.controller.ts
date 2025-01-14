/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { CampaignService } from './campaign.service';
import { ServerSuccess } from 'src/common/constant';
import { responseHelper } from 'src/core/helper/response.helper';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { FilterQuery } from './dto/query.dto';
import { UserType } from '../users/users.type';

@Controller()
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

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
    UserType.AUTHORITY_ADMIN,
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
}
