import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { GetQuoteDto } from '../quoter/dtos/get-quote.dto';

@ValidatorConstraint({ name: 'IsNotSameToken', async: false })
export class IsNotSameTokenConstraint implements ValidatorConstraintInterface {
  validate(toTokenAddress: string, args: ValidationArguments) {
    const object = args.object as GetQuoteDto;
    return (
      toTokenAddress.toLowerCase() !== object.fromTokenAddress.toLowerCase()
    );
  }

  defaultMessage(_args: ValidationArguments) {
    return 'Cannot trade token for itself';
  }
}
