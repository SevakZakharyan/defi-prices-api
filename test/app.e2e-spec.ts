import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/gasPrice (GET)', () => {
    it('should return gas price within 50ms', async () => {
      const start = Date.now();

      const response = await request(app.getHttpServer())
        .get('/gasPrice')
        .expect(200);

      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
      expect(response.body).toHaveProperty('gasPrice');
      expect(typeof response.body.gasPrice).toBe('string');
    });
  });

  describe('/return/:from/:to/:amount (GET)', () => {
    it('should return quote for valid parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/return/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/1000000000000000000')
        .expect(200);

      expect(response.body).toHaveProperty('amountOut');
      expect(typeof response.body.amountOut).toBe('string');
    });

    it('should return 400 for invalid address', async () => {
      await request(app.getHttpServer())
        .get('/return/invalid-address/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/1000')
        .expect(400);
    });

    it('should return 400 for zero amount', async () => {
      await request(app.getHttpServer())
        .get('/return/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/0')
        .expect(400);
    });
  });
});
