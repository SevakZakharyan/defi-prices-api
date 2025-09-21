import { calculateUniswapV2OutputAmount } from './amm.utils';
import { BigNumber } from 'ethers';

describe('calculateUniswapV2OutputAmount', () => {
  it('computes correct output', () => {
    const amountOut = calculateUniswapV2OutputAmount(
      BigNumber.from(1000),
      BigNumber.from(10000),
      BigNumber.from(20000),
    );

    expect(amountOut.gt(0)).toBe(true);
    expect(amountOut.lt(BigNumber.from(20000))).toBe(true);
  });
});
