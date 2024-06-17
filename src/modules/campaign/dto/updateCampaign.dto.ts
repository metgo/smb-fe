import { PartialType } from '@nestjs/mapped-types';
import { CreateCampaignDto } from './create-campaign.dto';

export class updateCampaignDto extends PartialType(CreateCampaignDto) {}
