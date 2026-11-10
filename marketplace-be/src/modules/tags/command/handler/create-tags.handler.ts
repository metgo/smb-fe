import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tags } from '../../schema/tags.schema';
import { CreateTagCommand } from '../create-tags.command';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { ObjectId } from 'typeorm';

@CommandHandler(CreateTagCommand)
export class CreateTagHandler implements ICommandHandler<CreateTagCommand> {
  constructor(
    @InjectModel(Tags.name)
    private readonly TagsModel: Model<Tags>,
  ) {}

  async execute(command: CreateTagCommand): Promise<ObjectId> {
    const {
      name, subcategoryId, icon, nameHe, nameAr,
    } = command;

    try {
      const existingTag = await this.TagsModel.exists({ name, nameHe, nameAr });

      if (existingTag) {
        return existingTag._id;
      }

      const newTagItem = {
        ...(name && { name }),
        ...(nameHe && { nameHe }),
        ...(nameAr && { nameAr }),
        ...(icon && { icon }),
        ...(subcategoryId && { subcategoryId }),
        createdAt: new Date(),
      };

      const newTag = new this.TagsModel(newTagItem);

      const tag = await newTag.save();

      return tag._id;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
