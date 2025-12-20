import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { BookModule } from './books/book.module';
import { UserActivityModule } from './user-activities/user-activity.module';
import { AuthModule } from './auth/auth.module';
import { GenreModule } from './genres/genre.module';
import { SeriesModule } from './series/series.module';
import { CommentModule } from './comment/comment.module';
import { RatingModule } from './ratings/rating.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { HighlightModule } from './highlights/highlight.module';
import { MailModule } from './mail/mail.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TestController } from './upload/rattinglimit.controller';

@Module({
  imports: [
    BookModule,
    UserModule,
    UserActivityModule,
    AuthModule,
    GenreModule,
    SeriesModule,
    CommentModule,
    RatingModule,
    HighlightModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT', '5432')),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        synchronize: true,
        autoLoadEntities: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    MailModule,
     ThrottlerModule.forRoot([
      {
        ttl: 60_000,   
        limit: 100,  
      },
    ]),
  ],
  controllers: [AppController,TestController],
  providers: [AppService,  {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },],
})
export class AppModule { }
