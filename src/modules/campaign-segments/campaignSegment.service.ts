/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { paginationConfig } from 'src/common/pagination.config';
import { ExternalApiWithCampCodeFilterQuery } from 'src/common/query-handler/external-api-campcode.query';
import { disSelect } from 'src/common/utils/select.handling';
import { CampaignSegment } from './schema/campaignSegment.schema';
import { createCampaignSegmentDto } from './dto/cfreateCampaignSegment.dto';
import { DMOService } from '../dmo/dmo.service';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { ExtendedProductFilterQuery } from 'src/modules/products/dto/external-api.query.dto';

@Injectable()
export default class CampaignSegmentService {
  constructor(
      @InjectModel('CampaignSegment')
      private CampaignSegmentModel: Model<CampaignSegment>,
      private readonly dmoService: DMOService,
      private readonly campaignService: CampaignService,
  ) {

  }

  async create(
    dto: createCampaignSegmentDto,
  ): Promise<CampaignSegment> {
    const newCampaignSegment = new this.CampaignSegmentModel({
      ...dto,
    });
    await newCampaignSegment.save();
    return newCampaignSegment;
  }

  async getAll(userId: string) {
    const dmoIds = await this.dmoService.getAllDMOById(userId);
    const items = await this.CampaignSegmentModel.find({ DMOs: { $in: dmoIds } }).exec();

    return items;
  }

  async getAllProducts(query: ExtendedProductFilterQuery) {
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

    if (!page && !limit) {
      const products = campaignSegment.products
        .filter((product: any) => {
          if (!query.categoriesId && !query.subCategoriesId) {
            return true;
          } if (query.subCategoriesId) {
            return product.subCategories.some(subCategory => query.subCategoriesId.includes(String(subCategory._id)));
          }

          return product.categories.some(category => query.categoriesId.includes(String(category._id)));
        }).map((product: any) => ({
          name: product.name,
          description: product.description,
          price: product.price,
          categories: product.categories,
          images: product.images,
          business: product.businessId,
          subCategories: product.subCategories,
        }));
      const totalData = products.length;

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
    const endIndex = pages * limits;
    const productsSlice = campaignSegment.products.slice(startIndex, endIndex);

    const paginatedProducts = productsSlice
      .filter((product: any) => {
        if (!query.categoriesId && !query.subCategoriesId) {
          return true;
        }
        if (query.subCategoriesId) {
          return product.subCategories.some(subCategory => query.subCategoriesId.includes(String(subCategory._id)));
        }
        return product.categories.some(category => query.categoriesId.includes(String(category._id)));
      })
      .map((product: any) => ({
        name: product.name,
        description: product.description,
        price: product.price,
        categories: product.categories,
        images: product.images,
        business: product.businessId,
        subCategories: product.subCategories,
      }));

    const totalData = paginatedProducts.length;

    const pageCount = Math.ceil(totalData / limits);

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

  async getAllBusiness(query: ExternalApiWithCampCodeFilterQuery) {
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

    const totalData = campaignSegment.businesses.length;

    if (!page && !limit) {
      const businesses = campaignSegment.businesses.map((business: any) => ({
        name: business.name,
        description: business.description,
        geoLocation: business.geoLocation,
        address: business.address,
        images: business.images,
        bussCategoriesId: business.bussCategoriesId,
      }));

      return {
        totalData,
        businesses,
      };
    }

    const pages = Number(page) || paginationConfig.page;
    const limits = Number(limit) || paginationConfig.limit;

    const startIndex = (pages - 1) * limits;
    const endIndex = pages * limits;
    const businessSlice = campaignSegment.businesses.slice(startIndex, endIndex);

    const paginatedBusiness = businessSlice.map((business: any) => ({
      name: business.name,
      description: business.description,
      geoLocation: business.geoLocation,
      address: business.address,
      images: business.images,
      bussCategoriesId: business.bussCategoriesId,
    }));

    const pageCount = Math.ceil(totalData / limits);

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
}
