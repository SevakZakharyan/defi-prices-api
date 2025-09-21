import {
  IsEthereumAddress,
  IsNotEmpty,
  IsNumberString,
  Matches,
  Validate,
} from 'class-validator';
import { IsNotSameTokenConstraint } from '../../validators/is-not-same-token.validator';
import { IsWithinUint256LimitConstraint } from '../../validators/is-within-uint256-limit.validator';

export class GetQuoteDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  fromTokenAddress: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  @Validate(IsNotSameTokenConstraint)
  toTokenAddress: string;

  @IsNumberString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d*$/, { message: 'Amount must be greater than 0' })
  @Validate(IsWithinUint256LimitConstraint, {
    message: 'Amount should be within uint256 limit',
  })
  amountIn: string;
}
