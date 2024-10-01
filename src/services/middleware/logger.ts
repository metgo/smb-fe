import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(
    @Inject('winston') private readonly logger: Logger, // Inject Winston logger
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const requestPayload = {
      path: req.path,
      method: req.method,
      payload: req.body,
      query: req.query,
      params: req.params,
      timestamp: new Date().toISOString(), // Add timestamp for when the request was made
    };

    // Log the API request path and payload (body)
    this.logger.info('API Request', requestPayload);
    console.log(requestPayload);
    next();
  }
}
