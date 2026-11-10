import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { FindByIdQuery } from '../find-by-id.query';
import { Theme } from '../../schema/theme.schema';

@QueryHandler(FindByIdQuery)
export class FindByIdHandler implements IQueryHandler<FindByIdQuery> {
  constructor(
    @InjectModel(Theme.name)
    private readonly ThemeModel: Model<Theme>,
  ) {}

  async execute(query: FindByIdQuery): Promise<Theme> {
    const theme = await this.ThemeModel.findById(query.id);
    return theme;
  }
}
