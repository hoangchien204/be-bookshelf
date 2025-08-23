import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from 'process';
import { UserModule } from './user/user.module';
import { BookModule } from './books/book.module';
import { UserActivityModule } from './user-activities/user-activity.module';
import { AuthModule } from './auth/auth.module';
import { GenreModule } from './genres/genre.module';
import { SeriesModule } from './series/series.module';
import { CommentModule } from './comment/comment.module';
import { RatingModule } from './ratings/rating.module';
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
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
