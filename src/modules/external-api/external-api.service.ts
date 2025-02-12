/* eslint-disable no-undef */
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';

import { paginationConfig } from 'src/common/pagination.config';
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { generateRandomIdentifier } from 'src/common/utils/random-identifierId-generator';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldName,
  queryhandler,
  updateById,
} from 'src/core/helper/query-helper';
import { CreateExternalApiDTO } from 'src/modules/external-api/dto';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';

@Injectable()
export class ExternalApiServices {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(ExternalApi.name)
    private readonly ExternalApiModel: Model<ExternalApi>,
  ) {}

  async create(loggedInUser: string, body: CreateExternalApiDTO) {
    try {
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
        createdAt: new Date(),
        identifierId: generateRandomIdentifier(
          body.companyName.substring(0, 4),
          18,
        ),
      });

      const newExternalAPI = await newExternalApi.save();
      this.logger.info('[EXTERNAL_API]: CREATED', { message: newExternalAPI });

      return newExternalAPI;
    } catch (err) {
      this.logger.error('[EXTERNAL_API]: FAILED TO CREATE', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async getAll(queries: CommonFilterQuery) {
    const { page, limit, ...query } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;
    const select = `${disSelect}`;

    let findQuery: {};
    const populate = {
      path: 'dmoId authorityId',
      select: `${disSelect}`,
    };

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
    try {
      const companyDetails = {
        name: body.companyName,
        phone: body.companyPhone,
        email: body.companyEmail,
        address: body.companyAddress,
      };

      const updateField = {
        ...body,
        companyDetails,
        updatedBy: loggedInUserId,
      };

      const updatedExternalApi = await updateById<ExternalApi>(
        this.ExternalApiModel,
        externalApiId,
        updateField,
      );

      if (!updatedExternalApi) {
        throw new NotFoundException(ServerErrors.EXTERNAL_API.NOT_FOUND);
      }
      this.logger.info('[EXTERNAL_API]: UPDATED', {
        message: updatedExternalApi,
      });

      return updatedExternalApi;
    } catch (err) {
      this.logger.error('[EXTERNAL_API]: FAILED TO UPDATE', {
        err: err.message,
      });
      exceptionHandling(err);
    }
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
    try {
      const externalApi = await findOneByFieldName<ExternalApi>(
        this.ExternalApiModel,
        fieldName,
        items,
      );
      if (!externalApi) {
        throw new ForbiddenException(ServerErrors.FORBIDDEN);
      }
      return externalApi;
    } catch (err) {
      this.logger.error('[EXTERNAL_API]: FAILED TO GET EXTERNAL API', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async findByIdentifierId(identifierId: string) {
    try {
      const externalApi = await findOneByFieldName<ExternalApi>(
        this.ExternalApiModel,
        'identifierId',
        identifierId,
      );
      if (!externalApi) {
        throw new ForbiddenException(ServerErrors.EXTERNAL_API.IDENTIFIER_ID);
      }
      return externalApi;
    } catch (err) {
      this.logger.error(
        `[EXTERNAL_API-${identifierId}]: FAILED TO GET EXTERNAL API'`,
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }
}
