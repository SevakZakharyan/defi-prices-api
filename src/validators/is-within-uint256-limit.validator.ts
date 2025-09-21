import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BigNumber } from 'ethers';

@ValidatorConstraint({ name: 'IsWithinUint256Limit', async: false })
export class IsWithinUint256LimitConstraint
  implements ValidatorConstraintInterface
{
  validate(amountIn: string, _args: ValidationArguments) {
    try {
      const amount = BigNumber.from(amountIn);
      const maxAmount = BigNumber.from(
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      );

      return amount.lte(maxAmount.div(1000));
    } catch {
      return false;
    }
  }

  defaultMessage(_args: ValidationArguments) {
    return 'Amount too large';
  }
}
