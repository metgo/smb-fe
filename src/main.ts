import { NestFactory } from '@nestjs/core';
import { DocumentBuilder } from '@nestjs/swagger';
import { OpenApiNestFactory } from 'nest-openapi-tools';

import { AppModule } from 'src/app.module';

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

  await app.listen(3000);
}
bootstrap();
