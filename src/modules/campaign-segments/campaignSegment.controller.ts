import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { CreateCampaignSegmentDTO } from 'src/modules/campaign-segments/dto/create-campaign-segment.dto';
import { UpdateCampaignSegmentDTO } from 'src/modules/campaign-segments/dto/update-campaign-segment.dto';
import { CampaignSegmentService } from 'src/modules/campaign-segments/campaignSegment.service';
import { GetByCampCodeQuery } from 'src/modules/campaign-segments/queries/get-by-campcode.query';
import { GetProductsByCampCodeQuery } from 'src/modules/campaign-segments/queries/get-products-by-campcode.query';
import { UserType } from 'src/modules/users/users.type';

@Controller()
export class CampaignSegmentController {
  constructor(
    private readonly campaignSegmentService: CampaignSegmentService,
  ) {}

  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Campaign Segment'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.CAMPAIGN_SEGMENT.CREATED,
    },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @Post('campaign-segment')
  async create(
    @Req() req,
    @Body() dto: CreateCampaignSegmentDTO,
    @Res() response: Response,
  ) {
    const campaignSegment = await this.campaignSegmentService.create(
      req.user.id,
      dto,
    );

    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.CAMPAIGN_SEGMENT.CREATED,
      campaignSegment,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO, UserType.DMOADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Campaign Segment'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.CAMPAIGN_SEGMENT.UPDATED,
    },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
    operation: 'Update by campaign Id',
  })
  @Patch('campaign-segment/:campaignId')
  async update(
    @Body() body: UpdateCampaignSegmentDTO,
    @Param('campaignId') campaignId: string,
    @Req() req,
    @Res() response: Response,
  ) {
    const campaignSegment = await this.campaignSegmentService.update(
      req.user.id,
      campaignId,
      body,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.CAMPAIGN_SEGMENT.UPDATED,
      campaignSegment,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Campaign Segment'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.CAMPAIGN_SEGMENT.DELETED,
    },
    noAuthToken: true,
    operation: 'Delete by campaign Id',
  })
  @Delete('campaign-segment/:campaignId')
  async deleteCampaignSegment(
    @Param('campaignId') campaignId: string,
    @Req() req,
    @Res() response: Response,
  ) {
    const campaignSegment = await this.campaignSegmentService.delete(
      req.user.id,
      campaignId,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.CAMPAIGN_SEGMENT.DELETED,
      campaignSegment,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin, Campaign Segment'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.CAMPAIGN_CREATED,
    },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @Get('campaign-segment/dmo')
  async getAllDMOsOfCampaignSegment(@Req() req, @Res() response: Response) {
    const campaign
      = await this.campaignSegmentService.getAllDMOsOfCampaignSegment(
        req.user.id,
      );
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
    tags: ['Campaign Segment'],
    response: { status: HttpStatus.OK, description: ServerSuccess.DMO_LISTED },
    operation: 'Get all DMOs related to a campaign',
    softBlockExtraDtoFields: true,
  })
  @Get('/campaigns/dmos')
  async getAllDMOsOfCampaign(
    @Res() response: Response,
    @Query() query?: GetByCampCodeQuery,
  ) {
    const dmos = await this.campaignSegmentService.getAllDMOsOfCampaign(query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.DMO_LISTED,
      dmos,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Campaign Segment'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    operation: 'Get all businesses related to a campaign',
    softBlockExtraDtoFields: true,
  })
  @Get('/campaigns/businesses')
  async getAllBusinessesOfCampaign(
    @Res() response: Response,
    @Query() query?: GetByCampCodeQuery,
  ) {
    const business = await this.campaignSegmentService.getAllBusiness(query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_LISTED,
      business,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Campaign Segment'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PRODUCTS.LISTED,
    },
    operation: 'Get all products related to a campaign',
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('/campaigns/products')
  async getAllProductsOfCampaign(
    @Res() response: Response,
    @Query() query: GetProductsByCampCodeQuery,
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
}
