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
    // dmoId: mongoose.Types.ObjectId,
  ): Promise<CampaignSegment> {
    // console.log(dmoId);
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
    const { page = paginationConfig.page, limit = paginationConfig.limit, campCode } = query;
    const pages = Number(page);
    const limits = Number(limit);

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

    const campaignSegment = await this.CampaignSegmentModel
      .findOne({ campaign_ID: campDetails._id })
      .populate(populate)
      .select(select)
      .lean()
      .exec();

    const totalData = campaignSegment.products.length;

    const startIndex = (pages - 1) * limit;
    const endIndex = pages * limit;
    const productsSlice = campaignSegment.products.slice(startIndex, endIndex);

    const paginatedProducts = productsSlice.map((product: any) => ({
      name: product.name,
      description: product.description,
      price: product.price,
      categories: product.categories,
      images: product.images,
    }));

    const pageCount = Math.ceil(totalData / limit);

    return {
      page: pages,
      limit: limits,
      totalData,
      products: paginatedProducts,
      pageCount,
      hasPreviousPage: pages > 1,
      hasNextPage: pages < pageCount,
    };
  }

  async getAllBusiness(query: ExternalApiWithCampCodeFilterQuery) {
    const { page = paginationConfig.page, limit = paginationConfig.limit, campCode } = query;
    const pages = Number(page);
    const limits = Number(limit);

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

    const startIndex = (pages - 1) * limit;
    const endIndex = pages * limit;
    const businessSlice = campaignSegment.businesses.slice(startIndex, endIndex);

    const paginatedBusiness = businessSlice.map((business: any) => ({
      name: business.name,
      description: business.description,
      geoLocation: business.geoLocation,
      address: business.address,
      images: business.images,
      bussCategoriesId: business.bussCategoriesId,
    }));

    const pageCount = Math.ceil(totalData / limit);

    return {
      page: pages,
      limit: limits,
      totalData,
      products: paginatedBusiness,
      pageCount,
      hasPreviousPage: pages > 1,
      hasNextPage: pages < pageCount,
    };
  }
}
