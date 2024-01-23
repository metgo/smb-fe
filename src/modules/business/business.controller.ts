/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
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
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { BusinessService } from './business.service';
import {
  AllFilterQuery, createBusinessDto, FilterQuery, updateBusinessDto, WebCreateBusiness,
} from './dto';
import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { UpdateBusinessByAdminDto } from 'src/modules/business/dto/update-business-status.dto';
import { DMOService } from 'src/modules/dmo/dmo.service';
import { UserType } from 'src/modules/users/users.type';
import { fileFilterByExtensions } from 'src/services/gcp-bucket/middleware/file-filter';
import { updateWebBusinessDto } from './dto/web.update.dto';

@Controller()
export class BusinessController {
  constructor(
    private readonly businessServices: BusinessService,
    private readonly dmoService: DMOService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Business'],
    response: { status: 201, description: ServerSuccess.BUSINESS_CREATED },
    noAuthToken: true,
    operation: 'Create a business by any logged in user',
  })
  @Post('business')
  async createBusiness(
    @Req() request,
    @Res() response: Response,
    @Body() dto: createBusinessDto,
  ) {
    const user = request.user.id;
    dto.name && await this.businessServices.findByFieldName('name', dto.name);
    dto.phoneNumber && await this.businessServices.findByFieldName('phoneNumber', dto.phoneNumber);
    dto.busiEmail && await this.businessServices.findByFieldName('busiEmail', dto.busiEmail);
    dto.dmoId && await this.dmoService.findDMO(dto.dmoId);
    const business = await this.businessServices.createBusiness(dto, user);
    return responseHelper(response, HttpStatus.CREATED, ServerSuccess.BUSINESS_CREATED, business, null, null);
  }

  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Business', 'Web'],
    response: { status: 201, description: ServerSuccess.BUSINESS_CREATED },
    noAuthToken: true,
    operation: 'Create a business by superadmin role',
  })
  @Post('admin/business')
  @UseInterceptors(AnyFilesInterceptor({ fileFilter: fileFilterByExtensions }))
  async createBusinessForWeb(
    @Req() request,
    @Res() response: Response,
    @Body() body: WebCreateBusiness,
    @UploadedFiles() image: Array<Express.Multer.File>,
  ) {
    const loggedInUserId = request.user.id;
    body.name && await this.businessServices.findByFieldName('name', body.name);
    body.phoneNumber && await this.businessServices.findByFieldName('phoneNumber', body.phoneNumber);
    body.busiEmail && await this.businessServices.findByFieldName('busiEmail', body.busiEmail);
    body.dmoId && await this.dmoService.findDMO(body.dmoId);
    const business = await this.businessServices.createBusinesForWeb(body, loggedInUserId, image);
    return responseHelper(response, HttpStatus.CREATED, ServerSuccess.BUSINESS_CREATED, business, null, null);
  }

  @ApiEndpoint({
    tags: ['Business'],
    response: { status: 200, description: ServerSuccess.BUSINESS_LISTED },
    softBlockExtraDtoFields: true,
    operation: 'Get all approved business by any user',
  })
  @Get('business')
  async getAllBusiness(
    @Res() response: Response,
    @Query() query?: FilterQuery,
  ) {
    const business = await this.businessServices.getAllBusiness(query);

    return responseHelper(response, HttpStatus.OK, ServerSuccess.BUSINESS_LISTED, business, null, null);
  }

  @Roles(UserType.ADMIN, UserType.DMO, UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Business'],
    response: { status: 200, description: ServerSuccess.BUSINESS_LISTED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Get all businesses by admin, superadmin and dmo role',
  })
  @Get('admin/businesses')
  async getAllBusinessForAdmin(
    @Res() response: Response,
    @Query() query?: AllFilterQuery,
  ) {
    const business = await this.businessServices.getAllBusiness(query, true);

    return responseHelper(response, HttpStatus.OK, ServerSuccess.BUSINESS_LISTED, business, null, null);
  }

  @ApiEndpoint({
    tags: ['Business'],
    response: { status: 200, description: ServerSuccess.BUSINESS_LISTED },
    operation: 'Get approved business detail by any user',
  })
  @Get('business/:idOrSlug')
  async getBusinessDetailForAll(
    @Res() response: Response,
    @Param('idOrSlug') idOrSlug: string,
  ) {
    const business = await this.businessServices.getBusiness({
      id: idOrSlug,
      loggedInUser: null,
    });

    return responseHelper(response, HttpStatus.OK, ServerSuccess.BUSINESS_LISTED, business, null, null);
  }

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Business'],
    response: { status: 200, description: ServerSuccess.BUSINESS_LISTED },
    noAuthToken: true,
    operation: 'Get any business detail by admin, superadmin, dmo role or business owner ',
  })
  @Get('admin/businesses/:id')
  async getBusinessDetailForAdmin(
    @Req() request,
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const business = await this.businessServices.getBusiness({
      id,
      loggedInUser: request.user,
    });

    return responseHelper(response, HttpStatus.OK, ServerSuccess.BUSINESS_LISTED, business, null, null);
  }

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Business'],
    response: { status: 200, description: ServerSuccess.BUSINESS_LISTED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Get all businesses details by business owner ',
  })
  @Get('my-business')
  async getMyBusiness(
    @Req() request,
    @Res() response: Response,
    @Query() query?: AllFilterQuery,
  ) {
    const userId = request.user.id;
    const business = await this.businessServices.getAllMyBusiness(query, userId);

    return responseHelper(response, HttpStatus.OK, ServerSuccess.BUSINESS_LISTED, business, null, null);
  }

  @ApiEndpoint({
    tags: ['Business'],
    response: { status: 200, description: ServerSuccess.BUSINESS_UPDATED },
    noAuthToken: true,
    params: [{ name: 'id', type: 'string', required: true }],
    operation: 'Update businesses details by business owner ',
  })
  @UseGuards(JwtAuthGuard)
  @Put('business/:id')
  async updateMyBusiness(
    @Req() request,
    @Res() response:Response,
    @Param('id') id: string,
    @Body() dto: updateBusinessDto,
  ) {
    dto.name && await this.businessServices.findByFieldNameExcludeId('name', dto.name, id);
    dto.phoneNumber && await this.businessServices.findByFieldNameExcludeId('phoneNumber', dto.phoneNumber, id);
    dto.busiEmail && await this.businessServices.findByFieldNameExcludeId('busiEmail', dto.busiEmail, id);
    dto.dmoId && await this.dmoService.findDMO(dto.dmoId);
    // need to check if the logged in user is business owner or collaborator
    const business = await this.businessServices.updateBusiness(id, request.user, dto);

    return responseHelper(response, HttpStatus.OK, ServerSuccess.BUSINESS_UPDATED, business, null, null);
  }

  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Business Web'],
    response: { status: 200, description: ServerSuccess.BUSINESS_UPDATED },
    noAuthToken: true,
    params: [{ name: 'id', type: 'string', required: true }],
    operation: 'Update businesses details by superadmin ',
  })
  @Put('admin/business/:id')
  async updateBusinessWeb(
    @Req() request,
    @Res() response:Response,
    @Param('id') id: string,
    @Body() dto: updateWebBusinessDto,
  ) {
    dto.name && await this.businessServices.findByFieldNameExcludeId('name', dto.name, id);
    dto.phoneNumber && await this.businessServices.findByFieldNameExcludeId('phoneNumber', dto.phoneNumber, id);
    dto.busiEmail && await this.businessServices.findByFieldNameExcludeId('busiEmail', dto.busiEmail, id);
    dto.dmoId && await this.dmoService.findDMO(dto.dmoId);
    const business = await this.businessServices.updateBusiness(id, request.user, dto);

    return responseHelper(response, HttpStatus.OK, ServerSuccess.BUSINESS_UPDATED, business, null, null);
  }

  @ApiEndpoint({
    tags: ['Admin', 'Business'],
    response: { status: 200, description: ServerSuccess.BUSINESS_UPDATED },
    noAuthToken: true,
    params: [{ name: 'businessId', type: 'string', required: true }],
  })
  @Roles(UserType.ADMIN, UserType.DMO, UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @Patch('admin/business/:businessId')
  async updateBusinessByAdmin(
    @Req() request,
    @Res() response: Response,
    @Param('businessId') businessId: string,
    @Body() dto: UpdateBusinessByAdminDto,
  ) {
    const business = await this.businessServices.updateBusiness(businessId, request.user, dto);

    return responseHelper(response, HttpStatus.OK, ServerSuccess.BUSINESS_UPDATED, business, null, null);
  }

  @ApiEndpoint({
    tags: ['Business'],
    response: { status: 200, description: ServerSuccess.BUSINESS_UPDATED },
    noAuthToken: true,
    params: [{ name: 'id', type: 'string', required: true }],
  })
  @UseGuards(JwtAuthGuard)
  @Delete('business/:id')
  async deleteBusiness(
    @Req() request,
    @Res() response:Response,
    @Param('id') bussId: string,
  ) {
    const business = await this.businessServices.deleteBusiness(bussId, request.user.id);

    return responseHelper(response, HttpStatus.OK, ServerSuccess.BUSINESS_UPDATED, business, null, null);
  }
}
