import { Module } from '@nestjs/common';
import { UrlController } from './modules/url/api/url.controller';
import { UrlService } from './modules/url/application/service/url.service';
import { UrlRepository } from './modules/url/infrastructure/url.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { Url } from './modules/url/domain/entity/url.model';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { getEnvConfig } from './core/common/config/env.config';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    CacheModule.register({
      // //store: redisStore,
      // host: 'localhost', //default host
      // port: 6379, //default port
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      load: [getEnvConfig],
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'postgres',
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USERNAME,
      password: String(process.env.POSTGRES_PASSWORD),
      database: process.env.POSTGRES_DATABASE,
      autoLoadModels: true,
      sync: { force: false, alter: true }, //only dev
    }),
    SequelizeModule.forFeature([Url]),
  ],
  controllers: [UrlController],
  providers: [
    UrlService,
    UrlRepository,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
