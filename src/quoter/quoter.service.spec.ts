import { Test, TestingModule } from '@nestjs/testing';
import { QuoterService } from './quoter.service';
import { EthereumProvider } from '../providers/ethereum.provider';
import { Cache } from 'cache-manager';
import { BigNumber, ethers } from 'ethers';
import {
  FACTORY_ADDRESS,
  TOKEN_A,
  TOKEN_B,
  WETH_USDC_PAIR,
} from '../../test/test.constants';

describe('QuoterService', () => {
  let service: QuoterService;
  let cache: jest.Mocked<Partial<Cache>>;
  let ethereumProvider: jest.Mocked<Partial<EthereumProvider>>;

  const mockFactory = { getPair: jest.fn() };
  const mockPair = {
    getReserves: jest.fn(),
    token0: jest.fn(),
  };

  beforeEach(async () => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
    } as jest.Mocked<Partial<Cache>>;

    ethereumProvider = {
      getContract: jest.fn().mockImplementation((address) => {
        if (address === FACTORY_ADDRESS) return mockFactory;
        return mockPair;
      }),
    } as jest.Mocked<Partial<EthereumProvider>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuoterService,
        { provide: EthereumProvider, useValue: ethereumProvider },
        { provide: 'CACHE_MANAGER', useValue: cache },
      ],
    }).compile();

    service = module.get(QuoterService);
  });

  it('returns amountOut when reserves are valid', async () => {
    mockFactory.getPair.mockResolvedValue('PAIR');
    mockPair.getReserves.mockResolvedValue([
      BigNumber.from('1000'),
      BigNumber.from('2000'),
    ]);
    mockPair.token0.mockResolvedValue(TOKEN_A);

    const result = await service.getQuote({
      fromTokenAddress: TOKEN_A,
      toTokenAddress: TOKEN_B,
      amountIn: '10',
    });

    expect(result).toHaveProperty('amountOut');
    expect(BigNumber.from(result.amountOut).gt(0)).toBe(true);
  });

  it('should handle reverse token order correctly', async () => {
    mockFactory.getPair.mockResolvedValue(WETH_USDC_PAIR);
    mockPair.getReserves.mockResolvedValue([
      BigNumber.from('10000'),
      BigNumber.from('3000'),
    ]);
    mockPair.token0.mockResolvedValue(TOKEN_B);

    const result = await service.getQuote({
      fromTokenAddress: TOKEN_A,
      toTokenAddress: TOKEN_B,
      amountIn: '1000',
    });

    expect(BigNumber.from(result.amountOut).gt(0)).toBe(true);
  });

  it('throws if pair does not exist', async () => {
    mockFactory.getPair.mockResolvedValue(ethers.constants.AddressZero);

    await expect(
      service.getQuote({
        fromTokenAddress: TOKEN_A,
        toTokenAddress: TOKEN_B,
        amountIn: '10',
      }),
    ).rejects.toThrow('Pair does not exist');
  });

  it('throws if no liquidity', async () => {
    mockFactory.getPair.mockResolvedValue('PAIR');
    mockPair.getReserves.mockResolvedValue([
      BigNumber.from(0),
      BigNumber.from(0),
    ]);
    mockPair.token0.mockResolvedValue(TOKEN_A);

    await expect(
      service.getQuote({
        fromTokenAddress: TOKEN_A,
        toTokenAddress: TOKEN_B,
        amountIn: '10',
      }),
    ).rejects.toThrow('No liquidity available in pool');
  });
});
