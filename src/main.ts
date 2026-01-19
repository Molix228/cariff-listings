import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'listing-service-client',
          brokers: [process.env.KAFKA_BROKER || ''],
          connectionTimeout: 3000,
          requestTimeout: 25000,
        },
        consumer: {
          groupId: 'listing-consumer-server',
          sessionTimeout: 30000,
          heartbeatInterval: 3000,
        },
      },
    },
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.listen();
}
bootstrap();
