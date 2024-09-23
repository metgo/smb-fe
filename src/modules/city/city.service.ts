/* eslint-disable prefer-const */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { paginationConfig } from 'src/common/pagination.config';
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { AuthorityService } from 'src/modules/authority/authority.service';
import { CityDTO } from 'src/modules/city/dto/create-city.dto';
import { City } from 'src/modules/city/schema/city.schema';

@Injectable()
export class CityService {
  constructor(
    @InjectModel('City')
    private readonly CityModel: Model<City>,
    private readonly authorityService: AuthorityService,
  ) {}

  async create(dto: CityDTO, userId: string) {
    const { dmoId } = await this.authorityService.getOne(dto.authorityId);
    const newCity = new this.CityModel({
      ...dto,
      dmoId,
      createdBy: userId,
      createdAt: new Date(),
    });

    const city = await newCity.save();
    return city;
  }

  async getAll(query: CommonFilterQuery) {
    const { page, limit, search } = query;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;
    const select = `${disSelect} -dmoId`;

    let findQuery: {} = {};

    const populate = {
      path: 'authorityId',
      select: `${disSelect}`,
      populate: {
        path: 'dmoId',
        select: `${disSelect} -userId -collaboratorsUser`,
      },
    };

    if (search) {
      findQuery = {
        name: { $regex: search, $options: 'i' },
      };
    }

    const cities = await queryhandler<City>(this.CityModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      populate,
    });

    return cities;
  }

  async getOne(id: string) {
    try {
      const select = `${disSelect} -dmoId`;

      const populate = {
        path: 'authorityId',
        select: `${disSelect}`,
        populate: {
          path: 'dmoId',
          select: `${disSelect} -userId -collaboratorsUser`,
        },
      };

      const city = await this.CityModel.findById(id)
        .select(select)
        .populate(populate)
        .exec();

      if (!city) {
        throw new NotFoundException(ServerErrors.CITY.NOT_FOUND);
      }

      return city;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
