import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { CommonStatus, SortOrder } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { OrderItemType } from 'src/modules/orders/orders.type';
import { PunchPass } from '../../schema/punch-pass.schema';
import { GetAllPunchPassesQuery } from '../get-all-punch-passes.query';

interface PunchPassListItem {
  _id: string;
  businessId: { _id: string; name: string; logo: string | null };
  price: PunchPass['price'];
  expiryDate: number;
  quantity?: PunchPass['quantity'];
  name: string;
  description: string;
  images: PunchPass['images'];
  catalogues: PunchPass['catalogues'];
  itemType: OrderItemType;
}

interface PaginatedPunchPasses {
  data: PunchPass[] | PunchPassListItem[];
  totalData: number;
  meta?: {
    page: number;
    limit: number;
    data: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

@QueryHandler(GetAllPunchPassesQuery)
export class GetAllPunchPassesHandler
implements IQueryHandler<GetAllPunchPassesQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(PunchPass.name)
    private readonly PunchPassModel: Model<PunchPass>,
  ) {}

  async execute(queries: GetAllPunchPassesQuery): Promise<PaginatedPunchPasses> {
    try {
      const {
        businessId, search, page, limit,
      } = queries.body;

      // Hide sold-out punch passes from customers - unlimited passes have no
      // quantity cap at all, so only exclude a capped one once nothing
      // remains to sell.
      const notSoldOut = {
        $or: [
          { 'quantity.isUnlimited': true },
          { quantity: { $exists: false } },
          { 'quantity.remaining': { $gt: 0 } },
        ],
      };

      const findQuery: any = {
        status: CommonStatus.APPROVED,
        isDeleted: { $ne: true },
        // $and (not a second top-level $or) so this can't be clobbered by
        // the search $or below.
        $and: [
          notSoldOut,
          ...(search
            ? [{
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
              ],
            }]
            : []),
        ],
        ...(businessId && { businessId }),
      };

      const result = (await queryhandler<PunchPass>(this.PunchPassModel, {
        findQuery,
        select: '',
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        sort: 'createdAt',
        sortOrder: SortOrder.DESC,
        populate: { path: 'businessId', select: '_id name nameHe nameAr logo' },
        isLean: true,
      })) as PaginatedPunchPasses;

      this.logger.info('[PUNCH-PASS]: PUNCH PASSES RETRIEVED (MARKETPLACE)');

      return {
        ...result,
        data: (result.data as PunchPass[])
          .map(punchPass => this.localizePunchPass(punchPass))
          .map(punchPass => this.shapeForList(punchPass)),
      };
    } catch (error) {
      this.logger.error('[PUNCH-PASS]: FAILED TO GET PUNCH PASSES (MARKETPLACE)', {
        err: error.message,
      });
      exceptionHandling(error);
    }
  }

  private shapeForList(punchPass: any): PunchPassListItem {
    const {
      _id, businessId, images, catalogues, price, expiryDate, quantity, name, description,
    } = punchPass;

    return {
      _id,
      businessId: businessId
        ? {
          _id: businessId._id,
          name: this.hebrewFirst(businessId.name, businessId.nameHe, businessId.nameAr),
          logo: businessId.logo?.image || null,
        }
        : businessId,
      price,
      expiryDate,
      quantity,
      name,
      description,
      images: images || [],
      catalogues,
      itemType: OrderItemType.PUNCH_PASS,
    };
  }

  private hebrewFirst(name: string, nameHe: string, nameAr: string) {
    return nameHe || name || nameAr;
  }

  private localizePunchPass(punchPass: any) {
    const {
      name, nameHe, nameAr, description, descriptionHe, descriptionAr, catalogues,
      ...rest
    } = punchPass;

    const localizedCatalogues = (catalogues || []).map((catalogue: any) => {
      const { nameHe: cNameHe, nameAr: cNameAr, ...catalogueRest } = catalogue;
      return {
        ...catalogueRest,
        name: this.hebrewFirst(catalogue.name, cNameHe, cNameAr),
      };
    });

    return {
      ...rest,
      name: this.hebrewFirst(name, nameHe, nameAr),
      description: this.hebrewFirst(description, descriptionHe, descriptionAr),
      catalogues: localizedCatalogues,
    };
  }
}
