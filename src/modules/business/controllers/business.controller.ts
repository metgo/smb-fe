/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import {
  AssignUserDto,
  createBusinessDto,
  UpdateBusinessByAdminDto,
  updateBusinessDto,
  WebCreateBusiness,
} from 'src/modules/business/dto';
import { GetBusinessByIdOrSlug } from 'src/modules/business/business.type';
import {
  GetAllBusinessesForGuestQuery,
  GetAllUnpaginatedBusinessQuery,
  GetBusinessStatsQuery,
  GetUsersBusinessesQuery,
} from 'src/modules/business/queries';
import { BusinessService } from 'src/modules/business/services/business.service';
import { UserType } from 'src/modules/users/users.type';
import { fileFilterByExtensions } from 'src/services/gcp-bucket/middleware/file-filter';

@Controller()
export class BusinessController {
  constructor(private readonly businessServices: BusinessService) {}

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Business'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.BUSINESS_CREATED,
    },
    noAuthToken: true,
    operation: 'Create a business by any logged in user',
  })
  @Post('business')
  @UseInterceptors(AnyFilesInterceptor({ fileFilter: fileFilterByExtensions }))
  async createBusiness(
    @Req() request,
    @Res() response: Response,
    @Body() dto: createBusinessDto,
    @UploadedFiles() image: Array<Express.Multer.File>,
  ) {
    const { user } = request;

    const business = await this.businessServices.createBusiness(
      dto,
      user,
      image,
    );
    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.BUSINESS_CREATED,
      business,
      null,
      null,
    );
  }

  @Roles(
    UserType.ADMIN,
    UserType.AUTHORITY,
    UserType.DMO,
    UserType.DMOADMIN,
    UserType.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Business', 'Business Admin'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_CREATED,
    },
    noAuthToken: true,
    operation:
      'Create a business by authority, dmo, dmo-admin of their respective area and superadmin',
  })
  @Post('admin/business')
  @UseInterceptors(AnyFilesInterceptor({ fileFilter: fileFilterByExtensions }))
  async createBusinessForWeb(
    @Req() request,
    @Res() response: Response,
    @Body() body: WebCreateBusiness,
    @UploadedFiles() image: Array<Express.Multer.File>,
  ) {
    const business = await this.businessServices.createBusinessByAdmins(
      body,
      request.user,
      image,
    );
    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.BUSINESS_CREATED,
      business,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Business'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Get all approved business by any user - paginated',
  })
  @Get('business')
  async getAllBusiness(
    @Res() response: Response,
    @Query() query?: GetAllBusinessesForGuestQuery,
  ) {
    const business = await this.businessServices.getAllBusiness(query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_LISTED,
      business,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Business'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Get all approved business by any user - nonPaginated',
  })
  @Get('businesses')
  async getAllBusinesses(
    @Res() response: Response,
    @Query() query?: GetAllUnpaginatedBusinessQuery,
  ) {
    const business = await this.businessServices.getAllUnpaginatedBusiness(
      query,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_LISTED,
      business,
      null,
      null,
    );
  }

  @Roles(
    UserType.AUTHORITY,
    UserType.AUTHORITY_ADMIN,
    UserType.DMO,
    UserType.DMOADMIN,
    UserType.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Business', 'Business Admin'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Get all businesses by superadmin and dmo-admin role',
  })
  @Get('admin/businesses')
  async getAllBusinessForAdmin(
    @Req() request,
    @Res() response: Response,
    @Query() query?: GetUsersBusinessesQuery,
  ) {
    const business = await this.businessServices.getAllBusiness(
      query,
      request.user,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_LISTED,
      business,
      null,
      null,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Business'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Get all businesses for map by admins',
  })
  @Get('admin/map-businesses')
  async getAllBusinessForMapByAdmin(
    @Req() request,
    @Res() response: Response,
    @Query() query?: GetUsersBusinessesQuery,
  ) {
    const businesses = await this.businessServices.getAllBusinessesForMap(
      query,
      request.user,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_LISTED,
      businesses,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Business'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Get all businesses for map by non-authenticated users',
  })
  @Get('map-businesses')
  async getAllBusinessForMap(
    @Res() response: Response,
    @Query() query?: GetAllUnpaginatedBusinessQuery,
  ) {
    const businesses = await this.businessServices.getAllBusinessesForMap(
      query,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_LISTED,
      businesses,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Business'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    operation: 'Get approved business detail by any user',
  })
  @Get('business/:idOrSlug')
  async getBusinessDetailFosrAll(
    @Res() response: Response,
    @Param('idOrSlug') idOrSlug: string,
  ) {
    const business = await this.businessServices.getBusiness({
      id: idOrSlug,
      loggedInUser: null,
    });

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_LISTED,
      business,
      null,
      null,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Business'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    operation: 'Get business detail of logged in user',
    noAuthToken: true,
  })
  @Get('my-business/:id')
  async getBusinessDetailOwner(
    @Res() response: Response,
    @Req() request: any,
    @Param('id') id: string,
  ) {
    const command: GetBusinessByIdOrSlug = {
      id,
      loggedInUser: request?.user,
    };
    const business = await this.businessServices.getBusiness(command);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_LISTED,
      business,
      null,
      null,
    );
  }

  @Roles(
    UserType.AUTHORITY,
    UserType.AUTHORITY_ADMIN,
    UserType.DMO,
    UserType.DMOADMIN,
    UserType.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Business', 'Business Admin'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    noAuthToken: true,
    operation:
      'Get any business detail by authority, dmo and dmo admin role and superadmin role',
  })
  @Get('admin/businesses/:id')
  async getBusinessDetailForAdmin(
    @Req() request,
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const business = await this.businessServices.getBusiness({
      id,
      loggedInUser: request.user,
    });

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_LISTED,
      business,
      null,
      null,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Business'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Get all businesses details by business owner ',
  })
  @Get('my-business')
  async getMyBusiness(
    @Req() request,
    @Res() response: Response,
    @Query() query?: GetUsersBusinessesQuery,
  ) {
    const userId = request.user.id;
    const business = await this.businessServices.getAllMyBusiness(
      query,
      userId,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_LISTED,
      business,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Business'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_UPDATED,
    },
    noAuthToken: true,
    params: [{ name: 'id', type: 'string', required: true }],
    operation: 'Update businesses details by business owner ',
  })
  @UseGuards(JwtAuthGuard)
  @Put('business/:id')
  async updateMyBusiness(
    @Req() request,
    @Res() response: Response,
    @Param('id') id: string,
    @Body() dto: updateBusinessDto,
  ) {
    const business = await this.businessServices.updateBusiness(
      id,
      request.user,
      dto,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_UPDATED,
      business,
      null,
      null,
    );
  }

  @Roles(
    UserType.AUTHORITY,
    UserType.AUTHORITY_ADMIN,
    UserType.DMO,
    UserType.DMOADMIN,
    UserType.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Business', 'Business Admin'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_UPDATED,
    },
    noAuthToken: true,
    params: [{ name: 'id', type: 'string', required: true }],
    operation:
      'Update businesses details by superadmin, authority, dmo and dmo-admin',
  })
  @Put('admin/business/:id')
  async updateBusinessWeb(
    @Req() request,
    @Res() response: Response,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessByAdminDto,
  ) {
    const business = await this.businessServices.updateBusinessByAdmin(
      id,
      request.user,
      dto,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_UPDATED,
      business,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Business', 'Business Admin'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_UPDATED,
    },
    noAuthToken: true,
    params: [{ name: 'businessId', type: 'string', required: true }],
  })
  @Roles(
    UserType.AUTHORITY,
    UserType.AUTHORITY_ADMIN,
    UserType.DMO,
    UserType.DMOADMIN,
    UserType.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard)
  @Patch('admin/business/:businessId')
  async updateBusinessByAdmin(
    @Req() request,
    @Res() response: Response,
    @Param('businessId') businessId: string,
    @Body() body: UpdateBusinessByAdminDto,
  ) {
    const business = await this.businessServices.updateBusinessByAdmin(
      businessId,
      request.user,
      body,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_UPDATED,
      business,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Business Admin', 'Business'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_UPDATED,
    },
    noAuthToken: true,
  })
  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @Patch('admin/businesses/assign-user')
  async assignUser(
    @Req() req,
    @Res() response: Response,
    @Body() body: AssignUserDto,
  ) {
    const assignedBusiness = await this.businessServices.assignUsertoBusinesses(
      body.businessesId,
      body.userId,
      req.user.id,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_UPDATED,
      assignedBusiness,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Business'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_UPDATED,
    },
    noAuthToken: true,
    params: [{ name: 'id', type: 'string', required: true }],
  })
  @UseGuards(JwtAuthGuard)
  @Delete('business/:id')
  async deleteBusiness(
    @Req() request,
    @Res() response: Response,
    @Param('id') bussId: string,
  ) {
    const business = await this.businessServices.deleteBusiness(
      bussId,
      request.user.id,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_UPDATED,
      business,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Business Admin', 'Business'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_UPDATED,
    },
    noAuthToken: true,
    params: [{ name: 'id', type: 'string', required: true }],
  })
  @Roles(
    UserType.AUTHORITY,
    UserType.AUTHORITY_ADMIN,
    UserType.DMO,
    UserType.DMOADMIN,
    UserType.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard)
  @Delete('admin/businesses/:id')
  async deleteBusinessByAdmin(
    @Req() request,
    @Res() response: Response,
    @Param('id') businessId: string,
  ) {
    const business = await this.businessServices.deleteBusinessByAdmin(
      businessId,
      request.user,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_UPDATED,
      business,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Business'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    noAuthToken: true,
  })
  @UseGuards(JwtAuthGuard)
  @Get('stats/businesses')
  async getBusinessStats(
    @Req() req,
    @Res() response: Response,
    @Query() query: GetBusinessStatsQuery,
  ) {
    const businessStats = await this.businessServices.getStats(req.user, query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_LISTED,
      businessStats,
      null,
      null,
    );
  }
}
