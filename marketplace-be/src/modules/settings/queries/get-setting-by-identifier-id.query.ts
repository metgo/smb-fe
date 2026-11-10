import { Locale } from 'src/common/enum';
import { SettingType } from '../settings.type';

export class GetSettingByIdentifierIdQuery {
  constructor(
    public readonly identifierId: string,
    public readonly locale?: Locale,
    public readonly type?: SettingType,
  ) {}
}
