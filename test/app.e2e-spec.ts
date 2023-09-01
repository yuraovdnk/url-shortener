import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Url } from '../src/modules/url/domain/entity/url.model';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        stopAtFirstError: true,
        transform: true,
      }),
    );
    await app.init();
  });

  describe('dfsd', () => {
    it('/ (POST) - should create', async () => {
      const res = await request(app.getHttpServer())
        .post('/')
        .send({
          url: 'https://www.youtube.com/',
        })
        .expect(HttpStatus.OK);
    });

    it('/ (POST)', async () => {
      const url = 'https://www.youtube.com';
      const res = await request(app.getHttpServer())
        .post('/')
        .send({
          url,
        })
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('redirect');

      const mock = {
        shortUrl: 'CDC8J',
        longUrl: url,
        expiresAt: expect.any(Date),
      };
      jest.spyOn(Url, 'initCreate').mockReturnValue(mock as Url);

      const res2 = await request(app.getHttpServer())
        .get(`/${mock.shortUrl}`)
        .expect(HttpStatus.FOUND);

      expect(res2.header.location).toEqual(expect.stringContaining(url));
    });
    it('if not exist', async () => {
      await request(app.getHttpServer())
        .get(`/buVkK`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Throttling', () => {
    it('POST:[HOST]/: should return 429 if throttled', async () => {
      const fakeUrl = 'https://www.youtube.com';
      const promises = [];
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

      await request(app.getHttpServer())
        .post('/')
        .send({
          url: fakeUrl,
        })
        .expect(HttpStatus.TOO_MANY_REQUESTS);
    });
  });
});
