import {
  Body, Controller, Get, Param, Post, Put,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { createBusinessDto, updateBusinessDto } from './dto';

@Controller()
export class BusinessController {
  constructor(private readonly businessServices: BusinessService) { }

  @Post('business')
  async createBusiness(@Body() dto: createBusinessDto) {
    return this.businessServices.createBusiness(dto);
  }

  @Get('business')
  async getAllBusiness() {
    return this.businessServices.getAllBusiness();
  }

  @Put('business/:id')
  async updateBusiness(
    @Param('id') bussId: string,
    @Body() dto: updateBusinessDto,
  ) {
    return this.businessServices.updateBusiness(bussId, dto);
  }
}
