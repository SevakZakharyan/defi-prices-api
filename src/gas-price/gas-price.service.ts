import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Interval } from '@nestjs/schedule';
import { EthereumProvider } from '../providers/ethereum.provider';
import { CACHE_CONFIG } from '../configs/cache.config';
import { GasPriceResponseDto } from './dtos/gas-price-response.dto';

const WARMUP_INTERVAL = 2500;

@Injectable()
export class GasPriceService implements OnModuleInit {
  private readonly logger = new Logger(GasPriceService.name);

  constructor(
    private readonly ethereumProvider: EthereumProvider,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  async onModuleInit() {
    await this.warmGasPriceCache();
  }

  public async getGasPrice(): Promise<GasPriceResponseDto> {
    const cachedGasPrice = await this.cacheManager.get<{ gasPrice: string }>(
      CACHE_CONFIG.GAS_PRICE.KEY,
    );

    if (cachedGasPrice) {
      return cachedGasPrice;
    }

    const gasPrice = await this.fetchGasPrice();
    await this.cacheManager.set(CACHE_CONFIG.GAS_PRICE.KEY, gasPrice, 0);

    return gasPrice;
  }

  private async fetchGasPrice(): Promise<GasPriceResponseDto> {
    try {
      const provider = this.ethereumProvider.getProvider();
      const gasPrice = await provider.getGasPrice();

      return {
        gasPrice: gasPrice.toString(),
      };
    } catch (error) {
      this.logger.error('Failed to fetch gas price:', error);
      throw new Error('Failed to fetch gas price');
    }
  }

  @Interval(WARMUP_INTERVAL)
  private async warmGasPriceCache(): Promise<void> {
    try {
      const gasPrice = await this.fetchGasPrice();
      await this.cacheManager.set(CACHE_CONFIG.GAS_PRICE.KEY, gasPrice, 0);

      this.logger.log(`Gas price cache updated: ${gasPrice.gasPrice} wei`);
    } catch (error) {
      this.logger.error('Failed to warm gas price cache:', error);
    }
  }
}
