import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {JsonLoggerService} from 'json-logger-service';
import {MicroserviceOptions, ServerGrpc, Transport} from "@nestjs/microservices";
import {join} from "path";

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.useLogger(new JsonLoggerService('Bonus service'));

  const uri = `${process.env.GRPC_HOST}:${process.env.GRPC_PORT}`
  console.log(`uri ${uri}`)

// microservice #1
  const microserviceGrpc = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: `${uri}`,
      package: 'bonus',
      protoPath: join(__dirname, './grpc/proto/bonus.proto'),
    }
  });

  await app.startAllMicroservices();

  await app.listen(3000);
}
bootstrap();
