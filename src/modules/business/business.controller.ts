import {
  Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { createBusinessDto, updateBusinessDto } from './dto';
import { Response } from 'express';
import { responseHelper } from 'src/core/helper/response.helper';
import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';

@Controller()
export class BusinessController {
  constructor(private readonly businessServices: BusinessService) { }

  @ApiEndpoint({
    tags: ['Business'],
    response: { status: 201, description: ServerSuccess.BUSINESS_CREATED },
  })
  @Post('business')
  async createBusiness(@Res() response:Response, @Body() dto: createBusinessDto) {
    const business = await this.businessServices.createBusiness(dto);
    return responseHelper(response, HttpStatus.CREATED, ServerSuccess.BUSINESS_CREATED, business, null, null);
  }

  @ApiEndpoint({
    tags: ['Business'],
    response: { status: 200, description: ServerSuccess.BUSINESS_LISTED },
  })
  @Get('business')
  async getAllBusiness(@Res() response: Response) {
    const business = await this.businessServices.getAllBusiness();

    return responseHelper(response, HttpStatus.OK, ServerSuccess.BUSINESS_LISTED, business, null, null);
  }

  @ApiEndpoint({
    tags: ['Business'],
    response: { status: 200, description: ServerSuccess.BUSINESS_LISTED },
  })
  @Get('business-details')
  async getBusiness(@Res() response: Response, @Param('id') id: string) {
    const business = await this.businessServices.getBusiness(id);

    return responseHelper(response, HttpStatus.OK, ServerSuccess.BUSINESS_LISTED, business, null, null);
  }

  @ApiEndpoint({
    tags: ['Business'],
    response: { status: 200, description: ServerSuccess.BUSINESS_UPDATED },
  })
  @Put('business/:id')
  async updateBusiness(
    @Res() response:Response,
    @Param('id') bussId: string,
    @Body() dto: updateBusinessDto,
  ) {
    const business = await this.businessServices.updateBusiness(bussId, dto);

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
    @Body() dto: updateBusinessDto,
  ) {
    const business = await this.businessServices.updateBusiness(bussId, dto);

    return responseHelper(response, HttpStatus.OK, ServerSuccess.BUSINESS_UPDATED, business, null, null);
  }
}
