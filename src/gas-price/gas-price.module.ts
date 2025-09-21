import { Module } from '@nestjs/common';
import { GasPriceService } from './gas-price.service';
import { GasPriceController } from './gas-price.controller';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [ProvidersModule],
  controllers: [GasPriceController],
  providers: [GasPriceService],
})
export class GasPriceModule {}
