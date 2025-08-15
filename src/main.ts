import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import * as express from 'express';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);


app.enableCors({
    origin: '*',
  });
  // Middleware bắt lỗi 413
  app.use(bodyParser.json({ limit: '200mb' }));
  app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

app.use(bodyParser.urlencoded({ extended: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
