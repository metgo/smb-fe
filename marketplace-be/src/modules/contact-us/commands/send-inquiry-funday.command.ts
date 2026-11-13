import { InquiryFundayRequest } from '../requests/inquiry-funday.request';

export class SendInquiryFundayCommand {
  constructor(public readonly body: InquiryFundayRequest) {}
}
