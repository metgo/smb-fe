import { Logger } from 'winston';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import {
  PromotionGroup,
  PromotionGroupDocument,
} from './schema/promotion-group.schema';
import type { Promotion } from './schema/promotion.schema';
import { ServerErrors } from 'src/common/constant';
import { ExternalApi } from '../external-api/schema/external-api.schema';

@Injectable()
export class PromotionsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(ExternalApi.name)
    private readonly ExternalApiModel: Model<ExternalApi>,
    @InjectModel(PromotionGroup.name)
    private readonly PromotionGroupModel: Model<PromotionGroupDocument>,
  ) {}

  async getPromotionsByIdentifierId(
    identifierId: string,
    locale: string = 'en',
    placement?: string,
  ): Promise<any> {
    try {
      const externalApi = await this.ExternalApiModel.findOne({ identifierId });
      if (!externalApi) {
        throw new ForbiddenException(ServerErrors.EXTERNAL_API.IDENTIFIER_ID);
      }

      const group = await this.PromotionGroupModel.findOne({
        externalApiId: externalApi._id,
        isDeleted: { $ne: true },
      })
        .populate({
          path: 'placementGroup.promotions.promoId',
          select: `
          _id 
          titleEn titleHe titleAr 
          descriptionEn descriptionHe descriptionAr
          mediaUrl linkUrl isActive placement mediaType
        `,
          match: { isDeleted: { $ne: true }, isActive: true },
        })
        .lean();

      if (!group) {
        throw new NotFoundException(ServerErrors.PROMOTION_GROUP.NOT_FOUND);
      }

      // Step 1: filter placement
      let placementGroups = group.placementGroup;
      if (placement) {
        placementGroups = placementGroups.filter(
          p => p.placement === placement,
        );
      }

      // Step 2: map locale fields
      const mapLocaleField = (obj: any, field: string) => {
        const key = field + locale.charAt(0).toUpperCase() + locale.slice(1);
        return obj[key] || obj[`${field}En`] || ''; // fallback to English
      };

      const result = placementGroups.map(pg => ({
        placement: pg.placement,
        rotationType: pg.rotationType,
        timeInterval: pg.timeInterval,
        promotions: pg.promotions.map(p => {
          const promo = p.promoId as Promotion;

          return {
            order: p.order,
            promoId: {
              _id: promo._id,
              title: mapLocaleField(promo, 'title'),
              description: mapLocaleField(promo, 'description'),
              mediaType: promo.mediaType,
              mediaUrl: promo.mediaUrl,
              linkUrl: promo.linkUrl,
            },
          };
        }),
      }));

      // 👉 If only one placement expected, return single object
      return placement ? result[0] : result;
    } catch (err) {
      this.logger.error('[PROMOTION_GROUP]: FAILED TO GET', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }
}
