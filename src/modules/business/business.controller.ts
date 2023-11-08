/* eslint-disable no-unused-expressions */
import {
  Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { createBusinessDto, FilterQuery, updateBusinessDto } from './dto';
import { Response } from 'express';
import { responseHelper } from 'src/core/helper/response.helper';
import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { DMOService } from '../dmo/dmo.service';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';

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
  })
  @Put('business/:id')
  async updateBusiness(
    @Res() response:Response,
    @Param('id') id: string,
    @Body() dto: updateBusinessDto,
  ) {
    dto.name && await this.businessServices.findByFieldNameExcludeId('name', dto.name, id);
    dto.phoneNumber && await this.businessServices.findByFieldNameExcludeId('phoneNumber', dto.phoneNumber, id);
    dto.busiEmail && await this.businessServices.findByFieldNameExcludeId('busiEmail', dto.busiEmail, id);
    dto.dmoId && await this.dmoService.findDMO(dto.dmoId);
    const business = await this.businessServices.updateBusiness(id, dto);

    return responseHelper(response, HttpStatus.OK, ServerSuccess.BUSINESS_UPDATED, business, null, null);
  }

  @ApiEndpoint({
    tags: ['Business'],
    response: { status: 200, description: ServerSuccess.BUSINESS_UPDATED },
  })
  @Delete('business/:id')
  async deleteBusiness(
    @Res() response:Response,
    @Param('id') bussId: string,
  ) {
    const business = await this.businessServices.deleteBusiness(bussId);

    return responseHelper(response, HttpStatus.OK, ServerSuccess.BUSINESS_UPDATED, business, null, null);
  }
}
