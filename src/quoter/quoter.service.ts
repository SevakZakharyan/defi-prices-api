import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EthereumProvider } from '../providers/ethereum.provider';
import { GetQuoteDto } from './dtos/get-quote.dto';
import { BLOCKCHAIN_CONFIG } from '../configs/blockchain.config';
import {
  UNISWAP_V2_FACTORY_ABI,
  UNISWAP_V2_PAIR_ABI,
} from '../utils/constants';
import { BigNumber, ethers } from 'ethers';
import { Cache } from 'cache-manager';
import { calculateUniswapV2OutputAmount } from '../utils/amm.utils';
import { GetQuoteResponseDto } from './dtos/get-quote-response.dto';

interface UniswapV2PairContract {
  getReserves(): Promise<[BigNumber, BigNumber, number]>;
  token0(): Promise<string>;
  token1(): Promise<string>;
}

interface UniswapV2FactoryContract {
  getPair(tokenA: string, tokenB: string): Promise<string>;
}

@Injectable()
export class QuoterService {
  constructor(
    private readonly ethereumProvider: EthereumProvider,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  public async getQuote(params: GetQuoteDto): Promise<GetQuoteResponseDto> {
    const from = ethers.utils.getAddress(params.fromTokenAddress);
    const to = ethers.utils.getAddress(params.toTokenAddress);
    const pairAddress = await this.getPairAddress(from, to);

    if (!pairAddress || pairAddress === ethers.constants.AddressZero) {
      throw new BadRequestException(`Pair does not exist for ${from} - ${to}`);
    }

    const pair = this.ethereumProvider.getContract(
      pairAddress,
      UNISWAP_V2_PAIR_ABI,
    ) as unknown as UniswapV2PairContract;

    const [reserves, token0] = await Promise.all([
      pair.getReserves(),
      pair.token0(),
    ]);

    const reserve0 = reserves[0];
    const reserve1 = reserves[1];

    if (reserve0.isZero() || reserve1.isZero()) {
      throw new BadRequestException('No liquidity available in pool');
    }

    const [reserveIn, reserveOut] = token0.toLowerCase() === from.toLowerCase()
        ? [reserve0, reserve1]
        : [reserve1, reserve0];

    const amountOut = calculateUniswapV2OutputAmount(
      params.amountIn,
      reserveIn,
      reserveOut,
    );

    this.validateAmountOut(amountOut, reserveOut);

    return { amountOut: amountOut.toString() };
  }

  private async getPairAddress(
    tokenA: string,
    tokenB: string,
  ): Promise<string | null> {
    const cacheKey = this.getPairCacheKey(tokenA, tokenB);
    const cached = await this.cacheManager.get<string>(cacheKey);

    if (cached !== undefined) {
      return cached;
    }

    const factory = this.ethereumProvider.getContract(
      BLOCKCHAIN_CONFIG.UNISWAP_V2_FACTORY,
      UNISWAP_V2_FACTORY_ABI,
    ) as unknown as UniswapV2FactoryContract;

    const pairAddress = await factory.getPair(tokenA, tokenB);
    const validAddress =
      pairAddress && pairAddress !== ethers.constants.AddressZero
        ? pairAddress
        : null;

    await this.cacheManager.set(cacheKey, validAddress, 0);

    return validAddress;
  }

  private getPairCacheKey(tokenA: string, tokenB: string): string {
    const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase()
        ? [tokenA, tokenB]
        : [tokenB, tokenA];
    return `pair:${token0}:${token1}`;
  }

  private validateAmountOut(amountOut: BigNumber, reserveOut: BigNumber): void {
    if (amountOut.isZero()) {
      throw new BadRequestException('Output amount too small');
    }

    if (amountOut.gte(reserveOut)) {
      throw new BadRequestException('Insufficient liquidity for trade amount');
    }
  }
}
