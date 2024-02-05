/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { convertToString } from 'src/common/convert-to-string';
import { getUniqueSet } from 'src/common/get-unique-set';
import { paginationConfig } from 'src/common/pagination.config';
import { ExternalApiWithCampCodeFilterQuery } from 'src/common/query-handler/external-api-campcode.query';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import { updateWhere } from 'src/core/helper/query-helper';
import { CampaignSegment } from './schema/campaignSegment.schema';
import { CreateCampaignSegmentDTO } from 'src/modules/campaign-segments/dto/create-campaign-segment.dto';
import { DMOService } from '../dmo/dmo.service';
import { BusinessStatus } from 'src/modules/business/business.type';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { ExtendedProductFilterQuery } from 'src/modules/products/dto/external-api.query.dto';
import { ProductStatus } from 'src/modules/products/products.type';
import { BusinessService } from 'src/modules/business/business.service';
import { CampaignSegmentOperation } from 'src/modules/campaign-segments/campaignSegment.type';
import { UpdateCampaignSegmentDTO } from 'src/modules/campaign-segments/dto/update-campaign-segment.dto';
import { GetByCampCodeQuery } from 'src/modules/campaign-segments/queries/get-by-campcode.query';
import { GetProductsByCampCodeQuery } from 'src/modules/campaign-segments/queries/get-products-by-campcode.query';
import { ProductsService } from 'src/modules/products/products.services';

@Injectable()
export class CampaignSegmentService {
  constructor(
      @InjectModel('CampaignSegment')
      private CampaignSegmentModel: Model<CampaignSegment>,
      private readonly dmoService: DMOService,
      private readonly campaignService: CampaignService,
      private readonly businessService: BusinessService,
      private readonly productsService: ProductsService,
  ) {}

  async create(
    loggedInUserId: string,
    dto: CreateCampaignSegmentDTO,
  ): Promise<CampaignSegment> {
    const existCampaignSegment = await this.getByCampaignId(dto.campaign_ID.toString());

    if (existCampaignSegment?.length) {
      throw new ConflictException(ServerErrors.CAMPAIGN.EXISTS);
    }

    // get all business of dmo
    const businessFromDMOs = await this.businessService.findManyByFieldIds('dmoId', dto.DMOs);
    const newBusinessList: string[] = [...new Set([...dto.businesses, ...businessFromDMOs])];

    // get all products of dmos
    const productsFromBusiness = await this.productsService.findManyByFieldIds('businessId', newBusinessList);
    const newProductsList = [...new Set([...dto.products, ...productsFromBusiness])];

    const newCampaignSegment = new this.CampaignSegmentModel({
      ...dto,
      businesses: newBusinessList,
      products: newProductsList,
      createdBy: loggedInUserId,
    });
    await newCampaignSegment.save();
    return newCampaignSegment;
  }

  async getByCampaignId(campaignid: string) {
    const campaignSegment = await this.CampaignSegmentModel.find({ campaign_ID: campaignid, isDeleted: false }).exec();

    return campaignSegment;
  }

  // eslint-disable-next-line consistent-return
  async update(
    loggedInUserId: string,
    campaignId: string,
    body: UpdateCampaignSegmentDTO,
  ): Promise<CampaignSegment> {
    try {
      let updatedCampaignSegment: CampaignSegment;
      let updatedField: object = {
        updatedBy: loggedInUserId,
      };

      const newDMOsList : string[] = body.DMOs?.length ? getUniqueSet(body.DMOs) : [];
      let newBusinessesList : string[] = body.businesses?.length ? [...body.businesses] : [];
      let newProductsList: string[] = body.products?.length ? [...body.products] : [];
      const newCrowedAgeList: string[] = body.crowed_age?.length ? getUniqueSet(body.crowed_age) : [];
      const newCrowedOriginList: string[] = body.crowed_origin?.length ? getUniqueSet(body.crowed_origin) : [];

      // get all business of dmo
      if (newDMOsList?.length) {
        const businessFromDMOs = await this.businessService.findManyByFieldIds('dmoId', body.DMOs);
        newBusinessesList = [...newBusinessesList, ...businessFromDMOs];
      }

      newBusinessesList = getUniqueSet(newBusinessesList);

      // get all products of business
      if (newBusinessesList?.length) {
        const productsFromBusiness = await this.productsService.findManyByFieldIds('businessId', newBusinessesList);
        newProductsList = [...newProductsList, ...productsFromBusiness];
      }

      newProductsList = getUniqueSet(newProductsList);

      // push new data
      if (body.operation === CampaignSegmentOperation.UPDATE) {
        const campaignSegmentDetails = await this.CampaignSegmentModel.findOne({
          campaign_ID: campaignId, isDeleted: false,
        });

        const businesses = getUniqueSet([...convertToString(campaignSegmentDetails.businesses), ...newBusinessesList]);
        const products = getUniqueSet([...convertToString(campaignSegmentDetails.products), ...newProductsList]);
        const DMOs = getUniqueSet([...convertToString(campaignSegmentDetails.DMOs), ...newDMOsList]);
        const crowedAge = getUniqueSet([...convertToString(campaignSegmentDetails.crowed_age), ...newCrowedAgeList]);
        const crowedOrigin = getUniqueSet(
          [...convertToString(campaignSegmentDetails.crowed_origin), ...newCrowedOriginList],
        );

        updatedField = {
          ...updatedField,
          businesses,
          products,
          DMOs,
          crowed_age: crowedAge,
          crowed_origin: crowedOrigin,
        };

        updatedCampaignSegment = await updateWhere<CampaignSegment>(
          this.CampaignSegmentModel,
          { campaign_ID: campaignId },
          {
            $set: updatedField,
          },
        );
      }

      // pop exisitng data
      if (body.operation === CampaignSegmentOperation.DELETE) {
        updatedCampaignSegment = await updateWhere<CampaignSegment>(
          this.CampaignSegmentModel,
          { campaign_ID: campaignId },
          {
            $pull: {
              DMOs: { $in: newDMOsList },
              businesses: { $in: newBusinessesList },
              products: { $in: newProductsList },
              crowed_age: { $in: newCrowedAgeList },
              crowed_origin: { $in: newCrowedOriginList },
            },
            $set: updatedField,
          },
        );
      }

      if (!updatedCampaignSegment) {
        throw new NotFoundException(ServerErrors.CAMPAIGN.NOT_FOUND);
      }
      return updatedCampaignSegment;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  // eslint-disable-next-line consistent-return
  async delete(
    loggedInUserId: string,
    campaignId: string,
  ): Promise<CampaignSegment> {
    try {
      const deletedCampaignSegment = await updateWhere<CampaignSegment>(
        this.CampaignSegmentModel,
        { campaign_ID: campaignId },
        {
          updatedBy: loggedInUserId,
          deletedAt: new Date(),
          deletedBy: loggedInUserId,
          isDeleted: true,
        },
      );

      if (!deletedCampaignSegment) {
        throw new NotFoundException(ServerErrors.CAMPAIGN.NOT_FOUND);
      }
      return deletedCampaignSegment;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async getAllDMOsOfCampaignSegment(userId: string) {
    const dmoIds = await this.dmoService.getAllDMOById(userId);
    const items = await this.CampaignSegmentModel.find({ DMOs: { $in: dmoIds } }).exec();

    return items;
  }

  async getAllDMOsOfCampaign(query: GetByCampCodeQuery) {
    const { page, limit, campCode } = query;
    const campDetails = await this.campaignService.findAndReturn('code', campCode);

    const select = disSelect;

    const populate = {
      path: 'DMOs',
      select: `${disSelect}`,
    };

    const campaignSegment = await this.CampaignSegmentModel
      .findOne({ campaign_ID: campDetails._id })
      .populate(populate)
      .select(select)
      .lean()
      .exec();

    if (!campaignSegment?.DMOs || !campaignSegment?.DMOs?.length) {
      return {
        totalData: 0,
        dmos: [],
      };
    }
    if (!page && !limit) {
      const dmos = campaignSegment.DMOs
        .map((dmo: any) => ({
          id: dmo._id,
          name: dmo.name,
        }));

      const totalData = dmos.length;

      return {
        totalData,
        dmos,
      };
    }

    const pages = Number(page) || paginationConfig.page;
    const limits = Number(limit) || paginationConfig.limit;

    const startIndex = (pages - 1) * limits;
    const endIndex = startIndex + limits;

    const filteredDMOs = campaignSegment?.DMOs
      .map((dmo: any) => ({
        id: dmo._id,
        name: dmo.name,
      }));

    const totalData = filteredDMOs.length;
    const pageCount = Math.ceil(totalData / limits);

    const paginatedDMOs = filteredDMOs.slice(startIndex, endIndex);

    return {
      page: pages,
      limit: limits,
      totalData,
      pageCount,
      hasPreviousPage: pages > 1,
      hasNextPage: pages < pageCount,
      businesses: paginatedDMOs,
    };
  }

  async getAllProducts(query: ExtendedProductFilterQuery | GetProductsByCampCodeQuery) {
    const { page, limit, campCode } = query;

    const campDetails = await this.campaignService.findAndReturn('code', campCode);

    const select = disSelect;
    const populate = {
      path: 'products',
      select: `${disSelect}`,
      populate: {
        path: 'categories',
        select: `${disSelect}`,
        populate: {
          path: 'icon',
          select: `${disSelect}`,
        },
      },
    };
    const populate1 = {
      path: 'products',
      select: `${disSelect}`,
      populate: {
        path: 'subCategories businessId',
        select: `${disSelect}`,
      },
    };

    const campaignSegment = await this.CampaignSegmentModel
      .findOne({ campaign_ID: campDetails._id })
      .populate(populate)
      .populate(populate1)
      .select(select)
      .lean()
      .exec();

    if (!campaignSegment?.products || !campaignSegment?.products?.length) {
      return {
        totalData: 0,
        products: [],
      };
    }

    if (!page && !limit) {
      const products = campaignSegment.products
        .filter((product: any) => {
          if (product.status === ProductStatus.INACTIVE) return false;
          if (!query.categoriesId && !query.subCategoriesId) {
            return true;
          } if (query.subCategoriesId) {
            return product.subCategories.some(subCategory => query.subCategoriesId.includes(String(subCategory._id)));
          }

          return product.categories.some(category => query.categoriesId.includes(String(category._id)));
        }).map((product: any) => ({
          id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          categories: product.categories,
          images: product.images,
          business: product.businessId,
          subCategories: product.subCategories,
        }));

      const totalData = products?.length;

      return {
        totalData,
        products,
      };
    }

    const pages = Number(page) || paginationConfig.page;
    const limits = Number(limit) || paginationConfig.limit;

    /**
     * actually this is not good way to slice the data and apply the filter
     * on this case but you can slice after you received the data
     * example if get 20 data anf we pass the limit 10, the bellow filter will filter from first 10 data
     * and we have the 8 data on next 10 datas.
     * need to change this please go over this
     */

    const startIndex = (pages - 1) * limits;
    const endIndex = startIndex + limits;

    const filteredProducts = campaignSegment.products
      .filter((product: any) => {
        if (product.status === ProductStatus.INACTIVE) return false;

        if (!query.categoriesId && !query.subCategoriesId) {
          return true;
        }
        if (query.subCategoriesId) {
          return product.subCategories.some(subCategory => query.subCategoriesId.includes(String(subCategory._id)));
        }
        return product.categories.some(category => query.categoriesId.includes(String(category._id)));
      })
      .map((product: any) => ({
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        categories: product.categories,
        images: product.images,
        business: product.businessId,
        subCategories: product.subCategories,
      }));

    const totalData = filteredProducts.length;
    const pageCount = Math.ceil(totalData / limits);

    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      page: pages,
      limit: limits,
      totalData,
      pageCount,
      hasPreviousPage: pages > 1,
      hasNextPage: pages < pageCount,
      products: paginatedProducts,
    };
  }

  async getAllBusiness(query: ExternalApiWithCampCodeFilterQuery | GetByCampCodeQuery) {
    const { page, limit, campCode } = query;

    const campDetails = await this.campaignService.findAndReturn('code', campCode);

    const select = disSelect;
    const populate = {
      path: 'businesses',
      select: `${disSelect}`,
      populate: {
        path: 'bussCategoriesId',
        select: `${disSelect}`,
        populate: {
          path: 'icon',
          select: `${disSelect}`,
        },
      },
    };

    const campaignSegment = await this.CampaignSegmentModel
      .findOne({ campaign_ID: campDetails._id })
      .populate(populate)
      .select(select)
      .lean()
      .exec();

    if (!campaignSegment?.businesses || !campaignSegment?.businesses?.length) {
      return {
        totalData: 0,
        businesses: [],
      };
    }

    if (!page && !limit) {
      const businesses = campaignSegment.businesses
        .filter((business: any) => {
          if (business.status === BusinessStatus.APPROVED) return true;
          return false;
        })
        .map((business: any) => ({
          id: business._id,
          name: business.name,
          description: business.description,
          geoLocation: business.geoLocation,
          address: business.address,
          images: business.images,
          bussCategoriesId: business.bussCategoriesId,
        }));

      const totalData = businesses.length;

      return {
        totalData,
        businesses,
      };
    }

    const pages = Number(page) || paginationConfig.page;
    const limits = Number(limit) || paginationConfig.limit;

    const startIndex = (pages - 1) * limits;
    const endIndex = startIndex + limits;

    const filteredBusiness = campaignSegment?.businesses
      .filter((business: any) => {
        if (business.status === BusinessStatus.APPROVED) return true;
        return false;
      })
      .map((business: any) => ({
        id: business._id,
        name: business.name,
        description: business.description,
        geoLocation: business.geoLocation,
        address: business.address,
        images: business.images,
        bussCategoriesId: business.bussCategoriesId,
      }));

    const totalData = filteredBusiness.length;
    const pageCount = Math.ceil(totalData / limits);

    const paginatedBusiness = filteredBusiness.slice(startIndex, endIndex);

    return {
      page: pages,
      limit: limits,
      totalData,
      pageCount,
      hasPreviousPage: pages > 1,
      hasNextPage: pages < pageCount,
      businesses: paginatedBusiness,
    };
  }

  // eslint-disable-next-line consistent-return
  async getCampaignAssociatedToProduct(id: string) {
    try {
      const campaignSegments = await this.CampaignSegmentModel.find({ products: { $in: [id] } });

      const campaignIds = campaignSegments.map(obj => obj.campaign_ID);

      return campaignIds;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
