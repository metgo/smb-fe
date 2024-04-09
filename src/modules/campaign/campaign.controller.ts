/* eslint-disable no-undef */
/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */
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
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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
import { DMOService } from '../dmo/dmo.service';
import { CampaignSegmentService } from 'src/modules/campaign-segments/campaignSegment.service';
import { CreateCampaignSegmentDTO } from 'src/modules/campaign-segments/dto/create-campaign-segment.dto';

@Controller()
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly dmoService: DMOService,
    private readonly campaignSegmentService: CampaignSegmentService,
  ) {}

  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO, UserType.DMOADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Campaign'],
    response: { status: 201, description: ServerSuccess.CAMPAIGN_CREATED },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @UseInterceptors(
    FileInterceptor('campImage', { fileFilter: fileFilterByExtensions }),
  )
  @Post('admin/campaign')
  async create(
    @Body() dto: createCampaignDto,
    @Req() request,
    @Res() response: Response,
    @UploadedFile() campImage: Express.Multer.File,
  ) {
    const user = request.user.id;
    await this.campaignService.findByFieldName('name', dto.name);
    await this.campaignService.findByFieldName('code', dto.code);

    const campaign = await this.campaignService.create(dto, campImage, user);

    const campaignSegmentDto: CreateCampaignSegmentDTO = {
      campaign_ID: campaign._id.toString(),
      DMOs: dto?.dmoId || [],
      businesses: dto?.businessId || [],
      products: dto?.productId || [],
      crowed_age: [],
      crowed_origin: [],
    };

    if (
      dto?.dmoId?.length
      && (request.user.role === UserType.DMO
        || request.user.role === UserType.DMOADMIN)
    ) {
      campaignSegmentDto.DMOs = [request.user.dmo.id.toString()];
    }

    await this.campaignSegmentService.create(
      request.user.id,
      campaignSegmentDto,
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
  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO, UserType.DMOADMIN)
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
  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
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

  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Campaign'],
    response: {
      status: 200,
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
    query.dmoId && (await this.dmoService.findDMOByUserID(user))._id;
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

  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO, UserType.DMOADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Campaign'],
    response: {
      status: 200,
      description: ServerSuccess.CAMPAIGN_UPDATED,
    },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @UseInterceptors(
    FileInterceptor('campImage', { fileFilter: fileFilterByExtensions }),
  )
  @Put('admin/campaign/:id')
  async update(
    @Res() response: Response,
    @Req() request,
    @Param('id') id: string,
    @Body() dto: updateCampaignDto,
    @UploadedFile() campImage?: Express.Multer.File,
  ) {
    const user = request.user.id;
    await this.campaignService.findByFieldNameExcludeId('name', dto.name, id);
    const campaign = await this.campaignService.update(
      id,
      dto,
      campImage,
      user,
    );
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
}
