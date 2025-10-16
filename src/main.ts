import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const allowedOrigins = [
  'http://localhost:5173',

];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,              
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
