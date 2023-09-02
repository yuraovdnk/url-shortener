import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { isArray } from 'class-validator';
import { ResponseError } from './errors-mapper';

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const stack =
      process.env.NODE_ENV !== 'production' ? exception.stack : undefined;

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      errorsMessages: [
        new ResponseError(exception.message || 'something went wrong'),
      ],
      stack,
    });
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errors: any = exception.getResponse();
    const status = exception.getStatus();

    const stack =
      process.env.NODE_ENV !== 'production' ? exception.stack : undefined;

    const errorsMessages = isArray(errors.message)
      ? errors.message
      : [new ResponseError(errors.message)];

    response.status(status).json({ errorsMessages, stack });
  }
}
