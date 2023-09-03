import { Module } from '@nestjs/common';
import { UrlController } from './modules/url/api/url.controller';
import { UrlService } from './modules/url/application/service/url.service';
import { UrlRepository } from './modules/url/infrastructure/url.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { Url } from './modules/url/domain/models/url.model';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { getEnvConfig } from './core/common/config/env.config';
import * as redisStore from 'cache-manager-redis-store';
import * as process from 'process';
import { TestsService } from '../test/test.service';
import { TaskService } from './core/common/schedule/task.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getEnvConfig],
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      ttl: +process.env.THROTTLER_TTL,
      limit: +process.env.THROTTLER_LIMIT,
    }),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
      auth_pass: process.env.REDIS_PASSWORD,
    }),
    ScheduleModule.forRoot(),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTRGRES_HOST,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USERNAME,
      password: String(process.env.POSTGRES_PASSWORD),
      database: process.env.POSTGRES_DATABASE,
      autoLoadModels: true,
      sync: { force: false, alter: true },
    }),
    SequelizeModule.forFeature([Url]),
  ],
  controllers: [UrlController],
  providers: [
    TaskService,
    TestsService,
    UrlService,
    UrlRepository,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
