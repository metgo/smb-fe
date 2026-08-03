import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SortOrder, CommonStatus, Locale } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { ServerErrors } from 'src/common/constant';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
// OLD (campCode/campaign-based filtering, replaced by associatedWebsiteIds match):
// import { CampaignService } from 'src/modules/campaign/campaign.service';
// import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import { PointOfInterestsAudit } from '../../schema/point-of-interest-audit.schema';
import { GetAllPOIsQuery } from '../get-all-pois.query';

@QueryHandler(GetAllPOIsQuery)
export class GetAllPOIsHandler implements IQueryHandler<GetAllPOIsQuery> {
  constructor(
    @InjectModel(PointOfInterestsAudit.name)
    private PointOfInterestsAuditModel: Model<PointOfInterestsAudit>,
    @InjectModel(ExternalApi.name)
    private ExternalApiModel: Model<ExternalApi>,
    // OLD:
    // @InjectModel(Campaign.name)
    // private CampaignModel: Model<Campaign>,
    // private readonly campaignService: CampaignService,
  ) {}

  async execute({ query }: GetAllPOIsQuery): Promise<any> {
    try {
      const {
        search,
        page,
        limit,
        identifierId,
        // campCode, // OLD — no longer accepted; identifierId is now required
        groupTypesId,
        accessibilitiesId,
        bussCategoriesId,
        bussSubCategoriesId,
        sortBy,
        sortOrder,
        locale,
      } = query;

      // OLD validation (pre associatedWebsiteIds migration):
      // if (!campCode && !identifierId) {
      //   throw new BadRequestException('Please enter identifierId or campCode');
      // }

      const siteSetting = await this.ExternalApiModel.findOne({
        identifierId,
      }).select('_id');

      if (!siteSetting) {
        throw new NotFoundException(`SITE ${ServerErrors.NOT_FOUND}`);
      }

      // OLD campaign-based resolution (replaced by direct associatedWebsiteIds match below):
      // const campDetails = await this.resolveCampDetails(campCode, identifierId);
      //
      // if (
      //   !campDetails?.dmoIds?.length
      //   && !campDetails?.authorityIds?.length
      //   && !campDetails?.businessIds?.length
      // ) {
      //   return { totalData: 0, data: [] };
      // }

      let findQuery: any = {
        status: CommonStatus.APPROVED,
        isActive: true,
        isDeleted: { $ne: true },
        associatedWebsiteIds: siteSetting._id,
      };

      // OLD $or conditions built from campaign dmoIds/authorityIds/businessIds:
      // const orConditions: any[] = [];
      // if (campDetails?.dmoIds?.length) {
      //   orConditions.push({ dmoId: { $in: campDetails.dmoIds } });
      // }
      // if (campDetails?.authorityIds?.length) {
      //   orConditions.push({ authorityId: { $in: campDetails.authorityIds } });
      // }
      // if (campDetails?.businessIds?.length) {
      //   orConditions.push({
      //     pointOfInterestId: { $in: campDetails.businessIds },
      //   });
      // }
      // if (orConditions.length) {
      //   findQuery.$or = orConditions;
      // }

      if (bussCategoriesId) {
        const categoriesIds = Array.isArray(bussCategoriesId)
          ? bussCategoriesId
          : [bussCategoriesId];

        findQuery = {
          ...findQuery,
          bussCategoriesId: { $in: categoriesIds },
        };
      }

      if (bussSubCategoriesId) {
        const subCategoriesIds = Array.isArray(bussSubCategoriesId)
          ? bussSubCategoriesId
          : [bussSubCategoriesId];

        findQuery = {
          ...findQuery,
          bussSubCategoriesId: { $in: subCategoriesIds },
        };
      }
      if (groupTypesId) {
        const groupTypeIds = Array.isArray(groupTypesId)
          ? groupTypesId
          : [groupTypesId];

        findQuery = {
          ...findQuery,
          groupTypesId: { $in: groupTypeIds },
        };
      }

      if (accessibilitiesId) {
        const accessibilitiesIds = Array.isArray(accessibilitiesId)
          ? accessibilitiesId
          : [accessibilitiesId];

        findQuery = {
          ...findQuery,
          accessibilitiesId: { $in: accessibilitiesIds },
        };
      }

      if (search) {
        findQuery = {
          ...findQuery,
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { nameHe: { $regex: search, $options: 'i' } },
            { nameAr: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { descriptionHe: { $regex: search, $options: 'i' } },
            { descriptionAr: { $regex: search, $options: 'i' } },
          ],
        };
      }

      const select
        = '_id name nameHe nameAr description descriptionHe descriptionAr geoLocation images logo primaryCategoryId address slug pointOfInterestId';

      const allPOIs = await queryhandler<PointOfInterestsAudit>(
        this.PointOfInterestsAuditModel,
        {
          findQuery,
          select,
          page,
          limit,
          sort: sortBy || 'createdAt',
          sortOrder: sortOrder || SortOrder.DESC,
          isLean: true,
        },
      );

      allPOIs.data = allPOIs.data.map((poi: any) => {
        const { pointOfInterestId, ...rest } = poi;
        return { ...rest, _id: pointOfInterestId };
      });

      if (locale) {
        allPOIs.data = allPOIs.data.map(poi => this.localize(poi, locale));
      }

      return allPOIs;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  // OLD helper — resolved campaign details via campCode, or via identifierId ->
  // ExternalApi.primaryCampIds[0] -> Campaign. Replaced by the direct
  // ExternalApi.findOne({ identifierId }) + associatedWebsiteIds match in execute().
  // private async resolveCampDetails(campCode: string, identifierId: string) {
  //   if (campCode) {
  //     return this.campaignService.findCampaignAndReturn('code', campCode);
  //   }
  //
  //   const externalApi = await this.ExternalApiModel.findOne({
  //     identifierId,
  //   }).select('_id primaryCampIds');
  //
  //   if (!externalApi) {
  //     throw new NotFoundException(`SITE ${ServerErrors.NOT_FOUND}`);
  //   }
  //
  //   return this.CampaignModel.findById(externalApi.primaryCampIds[0])
  //     .select('dmoIds authorityIds businessIds whitelist blacklist')
  //     .lean();
  // }

  private localize(poi: any, locale: string) {
    const {
      name,
      nameHe,
      nameAr,
      shortDescription,
      shortDescriptionHe,
      shortDescriptionAr,
      description,
      descriptionHe,
      descriptionAr,
      ...rest
    } = poi;

    switch (locale) {
      case Locale.ARABIC:
        return {
          ...rest,
          name: nameAr || name || nameHe,
          shortDescription:
            shortDescriptionAr || shortDescription || shortDescriptionHe,
          description: descriptionAr || description || descriptionHe,
        };
      case Locale.HEBREW:
        return {
          ...rest,
          name: nameHe || name || nameAr,
          shortDescription:
            shortDescriptionHe || shortDescription || shortDescriptionAr,
          description: descriptionHe || description || descriptionAr,
        };
      default:
        return {
          ...rest,
          name: name || nameHe || nameAr,
          shortDescription:
            shortDescription || shortDescriptionHe || shortDescriptionAr,
          description: description || descriptionHe || descriptionAr,
        };
    }
  }
}
