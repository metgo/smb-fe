import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  Get,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GenerateTagsCommand } from '../command/generate-tags.command';
import { GenerateTagsRequest } from '../requests/generate-tags.request';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { ServerSuccess } from 'src/common/constant';
import { GetTagsRequest } from '../requests/get-tags.request';
import { GetAllTagsQuery } from '../queries/get-all-tags.query';

@Controller('')
export class TagsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['v2 Tags'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.LISTED,
    },
    noAuthToken: true,
    operation: 'Generate tags based on name and description',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('generate-tags')
  async generate(@Body() body: GenerateTagsRequest) {
    return this.commandBus.execute(
      new GenerateTagsCommand(body.name, body.description),
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['v2 Tags'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.LISTED,
    },
    noAuthToken: true,
    operation: 'Get all Tags',
  })
  @HttpCode(HttpStatus.OK)
  @Get('tags')
  async getTags(@Query() query: GetTagsRequest) {
    return this.queryBus.execute(new GetAllTagsQuery(query.search));
  }
}
