import { Controller, Get, Logger, Param } from '@nestjs/common';
import { QuoterService } from './quoter.service';
import { GetQuoteDto } from './dtos/get-quote.dto';
import { GetQuoteResponseDto } from './dtos/get-quote-response.dto';

@Controller()
export class QuoterController {
  private readonly logger = new Logger(QuoterController.name);

  constructor(private readonly quoterService: QuoterService) {}

  @Get('return/:fromTokenAddress/:toTokenAddress/:amountIn')
  public async getQuote(@Param() params: GetQuoteDto): Promise<GetQuoteResponseDto> {
    try {
      return await this.quoterService.getQuote(params);
    } catch (error) {
      this.logger.error('Quote calculation failed', error);
      throw error;
    }
  }
}
