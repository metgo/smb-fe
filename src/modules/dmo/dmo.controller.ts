/* eslint-disable no-undef */
import {
  Controller, Get, HttpStatus, Query, Res,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { DMOService } from 'src/modules/dmo//dmo.service';
import { FilterQuery } from 'src/modules/dmo/dto';

@Controller()
export class DMOController {
  constructor(private readonly dmoServices: DMOService) {}

  @ApiEndpoint({
    tags: ['Admin', 'DMO'],
    response: {
      status: 200,
      description: ServerSuccess.DMO_LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @Get('admin/dmo')
  async getAllDMO(@Res() response: Response, @Query() query: FilterQuery) {
    const dmo = await this.dmoServices.getAllDMO(query);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.DMO_LISTED,
      dmo,
      null,
      null,
    );
  }
}
