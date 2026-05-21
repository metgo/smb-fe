import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DynamicEmailTemplate } from 'src/common/mailchimp/templateId';
import { formatDateHumanReadable } from 'src/common/utils/date-format';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import { SearchDictionary } from '../../schema/search-dictionary.schema';
import { NotifyNoResultCommand } from '../notify-no-result.command';

@CommandHandler(NotifyNoResultCommand)
export class NotifyNoResultHandler
implements ICommandHandler<NotifyNoResultCommand> {
  constructor(
    private readonly mailChimpService: MailChimpService,
    @InjectModel(SearchDictionary.name)
    private readonly searchDictionaryModel: Model<SearchDictionary>,
  ) {}

  async execute(command: NotifyNoResultCommand): Promise<void> {
    const { keyword, websiteUrl } = command;
    const normalizedKeyword = keyword.toLowerCase().trim();

    await this.searchDictionaryModel.findOneAndUpdate(
      { keyword: normalizedKeyword, websiteUrl: websiteUrl || null },
      { $inc: { count: 1 } },
      { upsert: true, new: true },
    );

    await this.mailChimpService.sendTransactionalEmail({
      to: 'checkasaransh@gmail.com',
      templatedId: DynamicEmailTemplate.NoSearchResult,
      mergeVars: {
        SEARCH_QUERY: keyword,
        WEBSITE_URL: websiteUrl || '',
        TIMESTAMP: formatDateHumanReadable(new Date()),
      },
    });
  }
}
