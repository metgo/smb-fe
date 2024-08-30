import { Injectable } from '@nestjs/common';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { ConfigService } from 'src/services/config/config.service';
import { GetUserEngagementQuery } from 'src/services/google-analytics/queries/get-user-engagement.queries';
import { ExternalApiTypes } from 'src/services/google-analytics/ga.types';

@Injectable()
export class GoogleAnalyticsService {
  private analyticsDataClient: BetaAnalyticsDataClient;

  constructor(private readonly configService: ConfigService) {
    const keyFilePath = configService.get('GCS_FILE_PATH');

    this.analyticsDataClient = new BetaAnalyticsDataClient({
      keyFile: keyFilePath,
    });
  }

  async userEngagementData(query: GetUserEngagementQuery) {
    try {
      if (!query.externalApi) {
        const { BALA_PROPERTY_ID, TAV8_PROPERTY_ID }
          = this.configService.googleAnalytics;
        const bala = await this.googleAnalyticsUserEngagement(
          query.startDate,
          query.endDate,
          BALA_PROPERTY_ID,
        );
        const tav8 = await this.googleAnalyticsUserEngagement(
          query.startDate,
          query.endDate,
          TAV8_PROPERTY_ID,
        );

        const total = [...bala, ...tav8];

        return total;
      }
      let externalApiPlatform;

      if (query.externalApi === ExternalApiTypes.BALA) {
        const { BALA_PROPERTY_ID } = this.configService.googleAnalytics;
        externalApiPlatform = BALA_PROPERTY_ID;
      }

      if (query.externalApi === ExternalApiTypes.TAV8) {
        const { TAV8_PROPERTY_ID } = this.configService.googleAnalytics;
        externalApiPlatform = TAV8_PROPERTY_ID;
      }

      const data = await this.googleAnalyticsUserEngagement(
        query.startDate,
        query.endDate,
        externalApiPlatform,
      );

      return data;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async engagementTime(query: GetUserEngagementQuery) {
    try {
      if (!query.externalApi) {
        const { BALA_PROPERTY_ID, TAV8_PROPERTY_ID }
          = this.configService.googleAnalytics;
        const bala = await this.googleAnalyticsUserEngagementDuration(
          query.startDate,
          query.endDate,
          BALA_PROPERTY_ID,
        );
        const tav8 = await this.googleAnalyticsUserEngagementDuration(
          query.startDate,
          query.endDate,
          TAV8_PROPERTY_ID,
        );

        const total = [...bala, ...tav8];

        return total;
      }
      let externalApiPlatform;

      if (query.externalApi === ExternalApiTypes.BALA) {
        const { BALA_PROPERTY_ID } = this.configService.googleAnalytics;
        externalApiPlatform = BALA_PROPERTY_ID;
      }

      if (query.externalApi === ExternalApiTypes.TAV8) {
        const { TAV8_PROPERTY_ID } = this.configService.googleAnalytics;
        externalApiPlatform = TAV8_PROPERTY_ID;
      }

      const data = await this.googleAnalyticsUserEngagementDuration(
        query.startDate,
        query.endDate,
        externalApiPlatform,
      );

      return data;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async activeUserData(query: GetUserEngagementQuery) {
    try {
      if (!query.externalApi) {
        const { BALA_PROPERTY_ID, TAV8_PROPERTY_ID }
          = this.configService.googleAnalytics;
        const bala = await this.googleAnalyticsActiveUser(
          query.startDate,
          query.endDate,
          BALA_PROPERTY_ID,
          'activeUsers',
        );
        const tav8 = await this.googleAnalyticsActiveUser(
          query.startDate,
          query.endDate,
          TAV8_PROPERTY_ID,
          'activeUsers',
        );

        const total = [...bala, ...tav8];

        return total;
      }
      let externalApiPlatform;

      if (query.externalApi === ExternalApiTypes.BALA) {
        const { BALA_PROPERTY_ID } = this.configService.googleAnalytics;
        externalApiPlatform = BALA_PROPERTY_ID;
      }

      if (query.externalApi === ExternalApiTypes.TAV8) {
        const { TAV8_PROPERTY_ID } = this.configService.googleAnalytics;
        externalApiPlatform = TAV8_PROPERTY_ID;
      }

      if (
        query.externalApi !== ExternalApiTypes.TAV8
        && query.externalApi !== ExternalApiTypes.BALA
      ) {
        return;
      }

      const data = await this.googleAnalyticsActiveUser(
        query.startDate,
        query.endDate,
        externalApiPlatform,
        'activeUsers',
      );

      return data;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async views(query: GetUserEngagementQuery) {
    try {
      if (!query.externalApi) {
        const { BALA_PROPERTY_ID, TAV8_PROPERTY_ID }
          = this.configService.googleAnalytics;
        const bala = await this.googleAnalyticsActiveUser(
          query.startDate,
          query.endDate,
          BALA_PROPERTY_ID,
          'screenPageViews',
        );
        const tav8 = await this.googleAnalyticsActiveUser(
          query.startDate,
          query.endDate,
          TAV8_PROPERTY_ID,
          'screenPageViews',
        );

        const total = [...bala, ...tav8];

        return total;
      }
      let externalApiPlatform;

      if (query.externalApi === ExternalApiTypes.BALA) {
        const { BALA_PROPERTY_ID } = this.configService.googleAnalytics;
        externalApiPlatform = BALA_PROPERTY_ID;
      }

      if (query.externalApi === ExternalApiTypes.TAV8) {
        const { TAV8_PROPERTY_ID } = this.configService.googleAnalytics;
        externalApiPlatform = TAV8_PROPERTY_ID;
      }

      if (
        query.externalApi !== ExternalApiTypes.TAV8
        && query.externalApi !== ExternalApiTypes.BALA
      ) {
        return [];
      }

      const data = await this.googleAnalyticsActiveUser(
        query.startDate,
        query.endDate,
        externalApiPlatform,
        'screenPageViews',
      );

      return data;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private async googleAnalyticsUserEngagement(
    startDate: string,
    endDate: string,
    externalApi: string,
  ) {
    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${externalApi}`,
        dateRanges: [
          {
            startDate,
            endDate,
          },
        ],
        dimensions: [
          {
            name: 'eventName',
          },
          {
            name: 'date',
          },
        ],
        metrics: [
          {
            name: 'eventCount',
          },
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: {
              matchType: 'EXACT',
              value: 'user_engagement',
            },
          },
        },
      });

      const formattedData = response?.rows
        .map(item => {
          const rawDate = item.dimensionValues[1].value;
          const formattedDate = `${rawDate.slice(0, 4)}-${rawDate.slice(
            4,
            6,
          )}-${rawDate.slice(6, 8)}`;
          const userCount = Number(item.metricValues[0].value);
          return { date: formattedDate, userCount };
        })
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

      return formattedData;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private async googleAnalyticsActiveUser(
    startDate: string,
    endDate: string,
    externalApi: string,
    type: string,
  ) {
    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${externalApi}`,
        dateRanges: [
          {
            startDate,
            endDate,
          },
        ],
        dimensions: [
          {
            name: 'date',
          },
        ],
        metrics: [
          {
            name: type,
          },
        ],
      });

      const formattedData = response?.rows
        .map(row => {
          const date = row?.dimensionValues[0]?.value;

          const formattedDate = `${date.slice(0, 4)}-${date.slice(
            4,
            6,
          )}-${date.slice(6, 8)}`;

          return {
            date: formattedDate,
            value: Number(row.metricValues[0].value),
          };
        })
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

      return formattedData;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private async googleAnalyticsUserEngagementDuration(
    startDate: string,
    endDate: string,
    externalApi: string,
  ) {
    const [response] = await this.analyticsDataClient.runReport({
      property: `properties/${externalApi}`,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [
        {
          name: 'date',
        },
      ],
      metrics: [
        {
          name: 'userEngagementDuration',
        },
        {
          name: 'activeUsers',
        },
      ],
    });

    const formattedData = response?.rows
      .map(row => {
        const date = row?.dimensionValues[0]?.value;
        const userEngagementDuration = parseInt(
          row?.metricValues[0]?.value,
          10,
        );
        const activeUsers = parseInt(row?.metricValues[1]?.value, 10);

        const averageEngagementTimePerUser = activeUsers
          ? userEngagementDuration / activeUsers
          : 0;
        const formattedDate = `${date.slice(0, 4)}-${date.slice(
          4,
          6,
        )}-${date.slice(6, 8)}`;

        return {
          date: formattedDate,
          averageEngagementTimePerUser: Number(
            averageEngagementTimePerUser.toFixed(2),
          ),
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return formattedData;
  }
}
