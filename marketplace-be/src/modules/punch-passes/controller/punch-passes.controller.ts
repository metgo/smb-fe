import {
  Controller, Get, HttpStatus, Query, HttpCode, Param,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Business } from 'src/modules/business/shared/schema/business.schema';
import { GetAllPunchPassesRequest } from '../request/get-all-punch-passes.request';
import { GetAllPunchPassesQuery } from '../queries/get-all-punch-passes.query';
import { GetPunchPassByIdQuery } from '../queries/get-punch-pass-by-id.query';

@Controller()
export class PunchPassesController {
  constructor(
    private readonly queryBus: QueryBus,
    @InjectModel(Business.name)
    private BusinessModel: Model<Business>,
  ) {}

  @ApiEndpoint({
    tags: ['Punch Passes'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PUNCH_PASS.LISTED,
    },
    operation: 'Get all approved punch passes - optionally scoped to one business',
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('/punch-passes')
  async getAllPunchPasses(@Query() query: GetAllPunchPassesRequest) {
    return this.queryBus.execute(new GetAllPunchPassesQuery(query));
  }

  @ApiEndpoint({
    tags: ['Punch Passes'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PUNCH_PASS.LISTED,
    },
    params: [
      {
        name: 'id',
        type: 'string',
        required: true,
      },
    ],
    softBlockExtraDtoFields: true,
    operation: 'Get punch pass detail by id',
  })
  @HttpCode(HttpStatus.OK)
  @Get('/punch-passes/:id')
  async getPunchPassById(
    @Param('id') id: string,
    @Query('checkout') checkout?: string,
  ) {
    const checkoutFlag = checkout === 'true';
    const punchPass: any = await this.queryBus.execute(
      new GetPunchPassByIdQuery(id, checkoutFlag),
    );

    // checkout response is its own pre-existing trimmed shape - leave as is.
    // This reshaping is controller-only (HTTP response), not the shared
    // GetPunchPassByIdQuery/handler - cart.service.ts and orders.services.ts
    // call that query directly and need the full punchPass shape to work.
    if (checkoutFlag) return punchPass;

    const business = await this.BusinessModel.findById(punchPass.businessId)
      .select('nameHe slug logo')
      .lean();

    return {
      _id: punchPass._id,
      businessId: business
        ? {
          _id: business._id,
          nameHe: business.nameHe,
          slug: business.slug,
          logo: business.logo?.image || '',
        }
        : null,
      userId: punchPass.userId,
      nameHe: punchPass.nameHe,
      descriptionHe: punchPass.descriptionHe,
      images: punchPass.images,
      catalogues: (punchPass.catalogues || []).map((catalogue: any) => ({
        _id: catalogue._id,
        nameHe: catalogue.nameHe || catalogue.name || catalogue.nameAr || '',
        quantity: catalogue.quantity,
        dateTime: catalogue.dateTime,
        type: catalogue.type,
        order: catalogue.order,
      })),
      price: punchPass.price,
      expiryDate: punchPass.expiryDate,
      quantity: punchPass.quantity,
      status: punchPass.status,
    };
  }
}
