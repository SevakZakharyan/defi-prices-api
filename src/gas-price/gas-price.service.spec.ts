import { Test, TestingModule } from '@nestjs/testing';
import { GasPriceService } from './gas-price.service';
import { EthereumProvider } from '../providers/ethereum.provider';
import { BigNumber } from 'ethers';

describe('GasPriceService', () => {
  let service: GasPriceService;
  let cache: { get: jest.Mock; set: jest.Mock };
  let ethereumProvider: {
    getProvider: jest.Mock<
      {
        getGasPrice: jest.Mock<Promise<any>, []>;
      },
      []
    >;
  };

  beforeEach(async () => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
    };

    ethereumProvider = {
      getProvider: jest.fn().mockReturnValue({
        getGasPrice: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GasPriceService,
        { provide: EthereumProvider, useValue: ethereumProvider },
        { provide: 'CACHE_MANAGER', useValue: cache },
      ],
    }).compile();

    service = module.get(GasPriceService);
  });

  it('returns cached gas price if available', async () => {
    cache.get.mockResolvedValueOnce({ gasPrice: '123' });

    const result = await service.getGasPrice();

    expect(result).toEqual({ gasPrice: '123' });
    expect(
      ethereumProvider.getProvider().getGasPrice as jest.Mock,
    ).not.toHaveBeenCalled();
  });

  it('fetches and caches gas price on cache miss', async () => {
    cache.get.mockResolvedValueOnce(null);
    (
      ethereumProvider.getProvider().getGasPrice as jest.Mock
    ).mockResolvedValueOnce(BigNumber.from('456'));

    const result = await service.getGasPrice();

    expect(result).toEqual({ gasPrice: '456' });
    expect(cache.set).toHaveBeenCalledWith('gas_price', { gasPrice: '456' }, 0);
  });

  it('throws if provider fails', async () => {
    cache.get.mockResolvedValueOnce(null);
    (
      ethereumProvider.getProvider().getGasPrice as jest.Mock
    ).mockRejectedValueOnce(new Error('Network error'));

    await expect(service.getGasPrice()).rejects.toThrow(
      'Failed to fetch gas price',
    );
  });
});
