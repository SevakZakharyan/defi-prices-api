import { BigNumber } from 'ethers';

export function calculateUniswapV2OutputAmount(
  amountIn: BigNumber | string,
  reserveIn: BigNumber | string,
  reserveOut: BigNumber | string,
): BigNumber {
  const amountInBN = BigNumber.from(amountIn);
  const reserveInBN = BigNumber.from(reserveIn);
  const reserveOutBN = BigNumber.from(reserveOut);

  const amountInWithFee = amountInBN.mul(997);
  const numerator = amountInWithFee.mul(reserveOutBN);
  const denominator = reserveInBN.mul(1000).add(amountInWithFee);

  return numerator.div(denominator);
}
