import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import {
  ErrorExceptionFilter,
  HttpExceptionFilter,
} from '../src/core/common/exception/exception.filter';
import { mapValidationErrors } from '../src/core/common/exception/errors-mapper';
import { TestsService } from './test.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('URL Controller (e2e)', () => {
  let app: INestApplication;
  let testService: TestsService;
  let cacheManager: Cache;
  const fakeUrl = 'https://www.youtube.com';

  function getShortUlr(str: string) {
    const part = str.split('/');
    return part[part.length - 1];
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        stopAtFirstError: true,
        transform: true,
        exceptionFactory: mapValidationErrors,
      }),
    );
    app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());
    cacheManager = moduleFixture.get<Cache>(CACHE_MANAGER);
    testService = app.get(TestsService);

    await app.init();
  });

  beforeEach(async () => {
    await Promise.all([cacheManager.reset(), testService.clearDb()]);
  });

  describe('throttling', () => {
    it('POST:[HOST]/: should return 429 if throttled', async () => {
      const promises = [];
      //make 5 times request to shorten url
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/')
            .send({
              url: fakeUrl,
            })
            .expect(HttpStatus.OK),
        );
      }
      await Promise.all(promises);

      //then doing sixt request and expect 429 exception
      await request(app.getHttpServer())
        .post('/')
        .send({
          url: fakeUrl,
        })
        .expect(HttpStatus.TOO_MANY_REQUESTS);
      //wait for reset ttl for next tests
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }, 15000);
  });

  describe('shorten url', () => {
    it('/(GET) - should throw exception if short url if not exist', async () => {
      //make request with not existing short url
      await request(app.getHttpServer())
        .get(`/buVkK`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('/(POST) - should shorten url and redirect', async () => {
      //make request to shorten url
      const res = await request(app.getHttpServer())
        .post('/')
        .send({
          url: fakeUrl,
        })
        .expect(HttpStatus.OK);

      //cut short url from origin url
      const shortUlr = getShortUlr(res.body.redirectUrl);

      //making request three times to original url
      const resultGetQuery = await request(app.getHttpServer())
        .get(`/${shortUlr}`)
        .expect(HttpStatus.FOUND);

      //expect that redirect is correct
      expect(resultGetQuery.header.location).toEqual(
        expect.stringContaining(fakeUrl),
      );
    });

    it('/(POST) - should shorten url and increment visit count', async function () {
      //make request to shorten url
      const response = await request(app.getHttpServer()).post('/').send({
        url: fakeUrl,
      });
      const shortUrl = getShortUlr(response.body.redirectUrl);

      //making request three times to original url
      await request(app.getHttpServer())
        .get(`/${shortUrl}`)
        .expect(HttpStatus.FOUND);

      await request(app.getHttpServer())
        .get(`/${shortUrl}`)
        .expect(HttpStatus.FOUND);

      await request(app.getHttpServer())
        .get(`/${shortUrl}`)
        .expect(HttpStatus.FOUND);

      //get stats by url
      const resultStats = await request(app.getHttpServer()).get(
        `/stats/${shortUrl}`,
      );
      expect(resultStats.body.visitCount).toBe(3);
    });
  });

  afterAll(() => {
    app.close();
  });
});
