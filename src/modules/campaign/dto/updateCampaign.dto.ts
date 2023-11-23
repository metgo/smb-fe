import { PartialType } from '@nestjs/mapped-types';
import { createCampaignDto } from './createCampaign.dto';

export class updateCampaignDto extends PartialType(createCampaignDto) { }
