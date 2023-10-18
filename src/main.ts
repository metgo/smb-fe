/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder } from '@nestjs/swagger';
import { OpenApiNestFactory } from 'nest-openapi-tools';

import { AppModule } from 'src/app.module';
import { ConfigService } from 'src/services/config/config.service';

const configService = new ConfigService();

const API_PORT = configService.get('API_PORT');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await OpenApiNestFactory.configure(
    app,
    new DocumentBuilder()
      .setTitle('METGO')
      .setDescription('API Documentation for MetGo'),
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

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(API_PORT);
  console.log(`Main process started with process: ${process.pid}:${API_PORT}`);
}
bootstrap();
