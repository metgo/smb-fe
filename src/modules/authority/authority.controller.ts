/* eslint-disable no-undef */
import {
  Controller,
  // Get, HttpStatus, Param, Query, Res,
} from '@nestjs/common';
// import { Response } from 'express';

// import { ServerSuccess } from 'src/common/constant';
// import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
// import { responseHelper } from 'src/core/helper/response.helper';
import { AuthorityService } from 'src/modules/authority/authority.service';
// import { GetAllAuthoritiesQuery } from 'src/modules/authority/queries/get-all-authorities.query';

@Controller()
export class AuthorityController {
  constructor(private readonly authorityService: AuthorityService) {}

  // @ApiEndpoint({
  //   tags: ['Authority'],
  //   response: {
  //     status: HttpStatus.OK,
  //     description: ServerSuccess.AUTHORITY.LISTED,
  //   },
  // })
  // @Get('authorities/:authorityId')
  // async getAuthority(
  //   @Param('authorityId') authorityId: string,
  //   @Res() response: Response,
  // ) {
  //   const authority = await this.authorityService.getOne(authorityId);

  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.AUTHORITY.LISTED,
  //     authority,
  //     null,
  //     null,
  //   );
  // }

  // @ApiEndpoint({
  //   tags: ['Authority'],
  //   response: {
  //     status: HttpStatus.OK,
  //     description: ServerSuccess.AUTHORITY.LISTED,
  //   },
  // })
  // @Get('authorities')
  // async getAllAuthority(
  //   @Query() query: GetAllAuthoritiesQuery,
  //   @Res() response: Response,
  // ) {
  //   const authorities = await this.authorityService.getAll(query);

  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.AUTHORITY.LISTED,
  //     authorities,
  //     null,
  //     null,
  //   );
  // }
}
