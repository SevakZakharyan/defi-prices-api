import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GasPriceModule } from './gas-price/gas-price.module';
import { QuoterModule } from './quoter/quoter.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ProvidersModule } from './providers/providers.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 10000,
    }),
    ScheduleModule.forRoot(),
    GasPriceModule,
    QuoterModule,
    ProvidersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
