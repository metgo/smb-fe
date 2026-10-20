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
import {
  PromotionApplyDto,
  PromotionListDto,
  PromotionReleaseDto,
  PromotionReleaseSessionDto,
  PromotionStateDto,
} from './dto/promotion-apply.dto';
import { PromotionOrdersService } from './promotion-orders.service';

@Controller('promotions')
export class PromotionOrdersController {
  constructor(private readonly promotionOrdersService: PromotionOrdersService) {}

  @ApiEndpoint({
    tags: ['Promotions'],
    operation: 'Get Lion Coin status and voucher counters for a list of businesses',
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
    operation: 'Per-business promotion voucher state for the cart strip (no reservation)',
    response: {
      status: HttpStatus.OK,
      description: 'Promotion voucher states listed',
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Post('state')
  async state(
    @Body() body: PromotionStateDto,
  ) {
    return this.promotionOrdersService.getVoucherStates(
      body.businesses.map(business => ({
        businessId: business.businessId,
        businessSubtotal: business.totalAmount,
      })),
      body.sessionId,
    );
  }

  @ApiEndpoint({
    tags: ['Promotions'],
    operation: 'Opt in for a business ("Apply N Lion Coins") and re-sync it on every cart change',
    response: {
      status: HttpStatus.OK,
      description: 'Promotion vouchers reserved to match the subtotal',
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Post('apply')
  async apply(
    @Body() body: PromotionApplyDto,
  ) {
    const result = await this.promotionOrdersService.applyAtDrawer(
      body.businessId,
      body.sessionId,
      body.totalAmount,
    );

    // Voucher codes are never exposed to the browser - checkout only needs the ids.
    return {
      ...result,
      vouchers: result.vouchers.map(voucher => ({ ...voucher, code: '' })),
    };
  }

  @ApiEndpoint({
    tags: ['Promotions'],
    operation: 'Opt out for a business ("Cancel") - releases this session\'s promotion vouchers',
    response: {
      status: HttpStatus.OK,
      description: 'Promotion vouchers released',
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Post('release')
  async release(
    @Body() body: PromotionReleaseDto,
  ) {
    const released = await this.promotionOrdersService.release(body.businessId, body.sessionId);

    return { businessId: body.businessId, released };
  }

  @ApiEndpoint({
    tags: ['Promotions'],
    operation: 'Buyer closed the payment page - release every promotion voucher this session holds',
    response: {
      status: HttpStatus.OK,
      description: 'Promotion vouchers released',
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Post('release-session')
  async releaseSession(
    @Body() body: PromotionReleaseSessionDto,
  ) {
    const released = await this.promotionOrdersService.releaseSession(body.sessionId);

    return { released };
  }

    @ApiEndpoint({
      tags: ['HOLD AND RESERVE'],
      operation: 'Lion Coin status and voucher counters for the given businesses',
      response: {
        status: HttpStatus.OK,
        description: 'Lion Coin reserved and Holded Businesses listed',
      },
      softBlockExtraDtoFields: true,
    })
  @HttpCode(HttpStatus.OK)
  @Post('list')
  async List(
    @Body() body: PromotionListDto,
  ) {
    return await this.promotionOrdersService.list(body.businessIds);
  }
}
