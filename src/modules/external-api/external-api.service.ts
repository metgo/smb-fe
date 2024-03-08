import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { paginationConfig } from 'src/common/pagination.config';
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldName,
  queryhandler,
  updateById,
} from 'src/core/helper/query-helper';
import { CreateExternalApiDTO } from 'src/modules/external-api/dto/create-external-api.dto';
import { ExternalApiRegisterRequest } from 'src/modules/external-api/dto/register-user.dto';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { UsersService } from 'src/modules/users/users.services';

@Injectable()
export class ExternalApiServices {
  constructor(
    @InjectModel(ExternalApi.name)
    private readonly ExternalApiModel: Model<ExternalApi>,
    private userService: UsersService,
  ) {}

  async create(loggedInUser: string, body: CreateExternalApiDTO) {
    const companyDetails = {
      name: body.companyName,
      phone: body.companyPhone,
      email: body.companyEmail,
      address: body.companyAddress,
    };
    const newExternalApi = new this.ExternalApiModel({
      ...body,
      companyDetails,
      createdBy: loggedInUser,
    });
    return newExternalApi.save();
  }

  async getAll(queries: CommonFilterQuery) {
    const { page, limit, ...query } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;
    const select = `${disSelect}`;

    let findQuery: {};
    let populate: {};
    let populate1: {};

    if (query.search) {
      findQuery = {
        name: { $regex: query.search, $options: 'i' },
      };
    }

    const externalApi = await queryhandler<ExternalApi>(this.ExternalApiModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      populate,
      populate1,
    });

    return externalApi;
  }

  async getById(id: string) {
    const select = `${disSelect}`;

    const externalApiDetail = await this.ExternalApiModel.findById(id)
      .select(select)
      .exec();

    return externalApiDetail;
  }

  async update(
    loggedInUserId: string,
    externalApiId: string,
    body: CreateExternalApiDTO,
  ) {
    const companyDetails = {
      name: body.companyName,
      phone: body.companyPhone,
      email: body.companyEmail,
      address: body.companyAddress,
    };

    const updateField = { ...body, companyDetails, updatedBy: loggedInUserId };

    const updatedExternalApi = await updateById<ExternalApi>(
      this.ExternalApiModel,
      externalApiId,
      updateField,
    );

    if (!updatedExternalApi) {
      throw new NotFoundException(ServerErrors.EXTERNAL_API.NOT_FOUND);
    }
    return updatedExternalApi;
  }

  async softDelete(loggedInUserId: string, externalApiId: string) {
    const updateField = {
      isDeleted: true,
      deletedAt: new Date(),
      updatedBy: loggedInUserId,
      deletedBy: loggedInUserId,
    };

    const externalApi = await updateById<ExternalApi>(
      this.ExternalApiModel,
      externalApiId,
      updateField,
    );
    if (!externalApi) {
      throw new NotFoundException(ServerErrors.EXTERNAL_API.NOT_FOUND);
    }
    return externalApi;
  }

  async findByFieldName(fieldName: keyof ExternalApi, items: string) {
    const externalApi = await findOneByFieldName<ExternalApi>(
      this.ExternalApiModel,
      fieldName,
      items,
    );
    if (!externalApi) {
      throw new BadRequestException(ServerErrors.EXTERNAL_API.NOT_FOUND);
    }
    return externalApi;
  }

  async registerUser(body: ExternalApiRegisterRequest) {
    const externalApi = await this.findByFieldName(
      'identifierId',
      body.identifierId,
    );
    const { identifierId, ...rest } = body;
    const newBody = { ...rest, externalApiId: externalApi._id };
    const user = await this.userService.create(newBody);

    return user;
  }
}
