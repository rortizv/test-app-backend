import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, body } = this.getStatusAndBody(exception);

    this.logger.warn(
      `${request.method} ${request.url} ${statusCode} - ${JSON.stringify(body)}`,
    );

    response.status(statusCode).json(body);
  }

  private getStatusAndBody(
    exception: unknown,
  ): { statusCode: number; body: ErrorResponseBody } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
          ? (exceptionResponse as { message?: string | string[] }).message
          : exception.message;
      return {
        statusCode: status,
        body: {
          statusCode: status,
          message: message ?? 'Unknown error',
          error: exception.name,
        },
      };
    }

    const message =
      exception instanceof Error ? exception.message : 'Internal server error';
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
        error: 'Internal Server Error',
      },
    };
  }
}
