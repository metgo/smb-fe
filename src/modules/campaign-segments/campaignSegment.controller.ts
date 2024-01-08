import {
  Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ExternalApiWithCampCodeFilterQuery } from 'src/common/query-handler/external-api-campcode.query';
import { ExternalApiGuard } from 'src/core/guards/authorization/external-api-guards';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { createCampaignSegmentDto } from './dto/cfreateCampaignSegment.dto';
import CampaignSegmentService from './campaignSegment.service';
import { UserType } from '../users/users.type';
import { ExtendedProductFilterQuery } from 'src/modules/products/dto/external-api.query.dto';

@Controller()
export class CampaignSegmentController {
  constructor(
    private readonly campaignSegmentService: CampaignSegmentService,
  ) { }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'CampaignSegment'],
    response: { status: 201, description: ServerSuccess.CAMPAIGN_CREATED },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @Post('campaign-segment')
  async create(
    @Body() dto: createCampaignSegmentDto,
    @Res() response: Response,
  ) {
    const campaignSegment = await this.campaignSegmentService.create(dto);

    return responseHelper(response, HttpStatus.CREATED, ServerSuccess.CAMPAIGN_CREATED, campaignSegment, null, null);
  }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin, CampaignSegment'],
    response: { status: 200, description: ServerSuccess.CAMPAIGN_CREATED },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @Get('campaign-segment/all')
  async getAll(
    @Req() req,
    @Res() response: Response,
  ) {
    const campaign = await this.campaignSegmentService.getAll(req.user.id);
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
    tags: ['Products', 'External Api'],
    response: { status: HttpStatus.OK, description: ServerSuccess.PRODUCTS.LISTED },
    operation: 'External Api - Get all products',
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(ExternalApiGuard)
  @Get('/externalapi/get_all_products')
  async getAllProductsForExternalApi(
    @Res() response: Response,
    @Query() query: ExtendedProductFilterQuery,
  ) {
    const product = await this.campaignSegmentService.getAllProducts(query);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.PRODUCTS.LISTED,
      product,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Business', 'External Api'],
    response: { status: 200, description: ServerSuccess.BUSINESS_LISTED },
    softBlockExtraDtoFields: true,
  })
  @UseGuards(ExternalApiGuard)
  @Get('/externalapi/get_all_businesses')
  async getAllBusinessForExternalApi(
    @Res() response: Response,
    @Query() query?: ExternalApiWithCampCodeFilterQuery,
  ) {
    const business = await this.campaignSegmentService.getAllBusiness(query);

    return responseHelper(response, HttpStatus.OK, ServerSuccess.BUSINESS_LISTED, business, null, null);
  }
}
