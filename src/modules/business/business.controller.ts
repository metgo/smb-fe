/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
import {
  Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Put, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { BusinessService } from './business.service';
import { createBusinessDto, FilterQuery, updateBusinessDto } from './dto';
import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { UpdateBusinessByAdminDto } from 'src/modules/business/dto/update-business-status.dto';
import { DMOService } from 'src/modules/dmo/dmo.service';
import { UserType } from 'src/modules/users/users.type';

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

  @ApiEndpoint({
    tags: ['Business'],
    response: { status: 200, description: ServerSuccess.BUSINESS_LISTED },
    softBlockExtraDtoFields: true,
  })
  @Get('business')
  async getAllBusiness(
    @Res() response: Response,
    @Query() query?: FilterQuery,
  ) {
    const business = await this.businessServices.getAllBusiness(query);

    return responseHelper(response, HttpStatus.OK, ServerSuccess.BUSINESS_LISTED, business, null, null);
  }

  @ApiEndpoint({
    tags: ['Business'],
    response: { status: 200, description: ServerSuccess.BUSINESS_LISTED },
  })
  @Get('business/:id')
  async getBusiness(@Res() response: Response, @Param('id') id: string) {
    const business = await this.businessServices.getBusiness(id);

    return responseHelper(response, HttpStatus.OK, ServerSuccess.BUSINESS_LISTED, business, null, null);
  }

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Business'],
    response: { status: 200, description: ServerSuccess.BUSINESS_LISTED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @Get('my-business')
  async getMyBusiness(
    @Req() request,
    @Res() response: Response,
    @Query() query?: FilterQuery,
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
  })
  @UseGuards(JwtAuthGuard)
  @Put('business/:id')
  async updateBusiness(
    @Req() request,
    @Res() response:Response,
    @Param('id') id: string,
    @Body() dto: updateBusinessDto,
  ) {
    dto.name && await this.businessServices.findByFieldNameExcludeId('name', dto.name, id);
    dto.phoneNumber && await this.businessServices.findByFieldNameExcludeId('phoneNumber', dto.phoneNumber, id);
    dto.busiEmail && await this.businessServices.findByFieldNameExcludeId('busiEmail', dto.busiEmail, id);
    dto.dmoId && await this.dmoService.findDMO(dto.dmoId);
    const business = await this.businessServices.updateBusiness(id, request.user.id, dto);

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
    const business = await this.businessServices.updateBusiness(businessId, request.user.id, dto);

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
