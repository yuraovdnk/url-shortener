import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

// @Catch(Error)
// export class ErrorExceptionFilter implements ExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();
//     if (process.env.environment !== 'production') {
//       response.status(500).send({
//         error: exception.toString(),
//         exception: exception.stack,
//       });
//     }
//     response.status(500).json('some error occurred');
//   }
// }

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    console.log('login');
    const errors: any = exception.getResponse();
    response.status(status).json({
      errorsMessages: errors.message,
    });

    //response.status(status).send();
  }
}
