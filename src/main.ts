import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { XssInterceptor } from './auth/xss.interceptor';

const allowedOrigins = [
  'http://localhost:5173',
  'https://bookshelf-8x8x.onrender.com',
  'https://bookshelf-5s4wfedkw-hoangchien204s-projects.vercel.app',
  'https://bookshelf-one-liard.vercel.app',
  'https://zenly.id.vn'
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new XssInterceptor());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();