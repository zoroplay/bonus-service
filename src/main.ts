import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {JsonLoggerService} from 'json-logger-service';
import {MicroserviceOptions, ServerGrpc, Transport} from "@nestjs/microservices";
import {join} from "path";

async function bootstrap() {

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      url: `${process.env.GRPC_HOST}:${process.env.GRPC_PORT}`,
      package: 'bonus',
      protoPath: join('node_modules/sbe-service-proto/proto/bonus.proto'),
    }
  });

  app.useLogger(new JsonLoggerService('Bonus service'));


  await app.listen();
}
bootstrap();
