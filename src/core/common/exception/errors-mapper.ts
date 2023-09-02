import { BadRequestException } from '@nestjs/common';

export function mapValidationErrors(errors) {
  const responseError: ResponseError[] = [];
  errors.forEach((item) => {
    const constraintKeys = Object.keys(item.constraints);
    constraintKeys.forEach((key) => {
      responseError.push(
        new ResponseError(item.constraints[key], item.property),
      );
    });
  });
  throw new BadRequestException(responseError);
}

export class ResponseError {
  constructor(private message: string, private field?: string) {}
}
