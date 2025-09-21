import { Controller, Get, Logger } from '@nestjs/common';
import { GasPriceService } from './gas-price.service';
import { GasPriceResponseDto } from './dtos/gas-price-response.dto';

@Controller()
export class GasPriceController {
  private readonly logger = new Logger(GasPriceController.name);

  constructor(private readonly gasPriceService: GasPriceService) {}

  @Get('gasPrice')
  public async getGasPrice(): Promise<GasPriceResponseDto> {
    const startTime = Date.now();

    try {
      const result = await this.gasPriceService.getGasPrice();
      const responseTime = Date.now() - startTime;

      if (responseTime > 50) {
        this.logger.warn(`Response time exceeded 50ms: ${responseTime}ms`);
      } else {
        this.logger.debug(`Response time: ${responseTime}ms`);
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to get gas price', error);
      throw error;
    }
  }
}
