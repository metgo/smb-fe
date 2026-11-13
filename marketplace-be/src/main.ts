/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder } from '@nestjs/swagger';
import { OpenApiNestFactory } from 'nest-openapi-tools';
import { UsersService } from 'src/modules/users/users.services';
import { AppModule } from 'src/app.module';
import { ConfigService } from 'src/services/config/config.service';
import { WinstonModule } from 'nest-winston';
import winstonConfig from 'src/services/winston/winston';

const configService = new ConfigService();

const API_PORT = configService.get('API_PORT');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
    abortOnError: false,
  });
  app.enableCors();
  const seederService = app.get(UsersService);

  await seederService.seedSuperadmin();

  await OpenApiNestFactory.configure(
    app,
    new DocumentBuilder()
      .setTitle('METGO')
      .setDescription('API Documentation for MetGo')
      .addBearerAuth(
        {
          description: 'Default JWT Authorization',
          type: 'http',
          in: 'header',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'defaultBearerAuth',
      ),
    {
      webServerOptions: {
        enabled: true,
        path: 'swagger-docs',
      },
      fileGeneratorOptions: {
        enabled: true,
        outputFilePath: './openapi.yaml',
      },
      clientGeneratorOptions: {
        enabled: true,
        type: 'typescript-axios',
        outputFolderPath: '../typescript-api-client/src',
        additionalProperties:
          'apiPackage=clients,modelPackage=models,withoutPrefixEnums=true,withSeparateModelsAndApi=true',
        openApiFilePath: './openapi.yaml',
        skipValidation: false,
      },
    },
    {
      operationIdFactory: (c: string, method: string) => method,
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  await app.listen(API_PORT);
  console.log(`Main process started with process: ${process.pid}:${API_PORT}`);
}
bootstrap();
