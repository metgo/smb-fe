import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';

import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { PromotionApplyDto, PromotionReleaseDto } from './dto/promotion-apply.dto';
import { PromotionOrdersService } from './promotion-orders.service';

@Controller('promotions')
export class PromotionOrdersController {
  constructor(private readonly promotionOrdersService: PromotionOrdersService) {}

  @ApiEndpoint({
    tags: ['Promotions'],
    operation: 'Get Lion Coin status for a list of businesses',
    response: {
      status: HttpStatus.OK,
      description: 'Lion Coin status listed',
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get('status')
  async getStatus(@Query('businessIds') businessIds: string) {
    if (!businessIds) {
      throw new BadRequestException('businessIds query param is required');
    }

    const ids = businessIds.split(',').map(id => id.trim()).filter(Boolean);

    return this.promotionOrdersService.getStatusForBusinesses(ids);
  }

  @ApiEndpoint({
    tags: ['Promotions'],
    operation: 'Reserve a business\'s Lion Coin from the cart drawer ("Enable Discount")',
    response: {
      status: HttpStatus.OK,
      description: 'Lion Coin reserved',
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Post('apply')
  async apply(
    @Body() body: PromotionApplyDto,
  ) {
    const { promotionOrder, sessionId } = await this.promotionOrdersService.applyAtDrawer(
      body.businessId,
      body.sessionId,
      body.totalAmount,
    );

    if (!promotionOrder) {
      return { businessId: body.businessId };
    }

    // Fetch full voucher details from database
    const voucher = await this.promotionOrdersService.getVoucherById(promotionOrder.voucherId?.toString());

    return {
      businessId: body.businessId,
      _id: promotionOrder._id.toString(),
      status: promotionOrder.status,
      sessionId, // Return the sessionId (generated or provided)
      vouchers: voucher ? {
        _id: voucher._id?.toString(),
        code: '',
        remainingAmount: voucher.remainingAmount,
        expireDate: voucher.expireDate,
        paymentStatus: voucher.paymentStatus,
      } : null,
    };
  }

  @ApiEndpoint({
    tags: ['Promotions'],
    operation: 'Release a held Lion Coin from the cart drawer ("Cancellation of Use")',
    response: {
      status: HttpStatus.OK,
      description: 'Lion Coin released',
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Post('release')
  async release(
    @Body() body: PromotionReleaseDto,
  ) {
    await this.promotionOrdersService.release(body.businessId, body.sessionId);

    return { businessId: body.businessId, status: 'AVAILABLE' };
  }
}
