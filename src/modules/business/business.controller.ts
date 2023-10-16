import { Body, Controller, Post } from '@nestjs/common';
import { BusinessService } from './business.service';
import { createBusinessDto } from './dto';

@Controller()
export class BusinessController {
  constructor(private readonly businessServices: BusinessService) { }

  @Post('business/')
  async createBusiness(@Body() dto: createBusinessDto) {
    return this.businessServices.createBusiness(dto);
  }
}
