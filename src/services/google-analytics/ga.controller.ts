import { Controller } from '@nestjs/common';

import { GoogleAnalyticsService } from 'src/services/google-analytics/ga.services';

@Controller()
export class GAController {
  constructor(private gaServices: GoogleAnalyticsService) {}
}
