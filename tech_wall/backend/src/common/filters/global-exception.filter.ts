import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { Response } from 'express';

interface ErrorResponseBody {
  success: false;
  erro: string;
  detalhes: string;
  mensagens: string[];
  statusCode: number;
}

/** Standard HTTP status texts used to detect "default" vs "custom" messages. */
const DEFAULT_STATUS_TEXTS: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
  [HttpStatus.NOT_ACCEPTABLE]: 'Not Acceptable',
  [HttpStatus.REQUEST_TIMEOUT]: 'Request Timeout',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.GONE]: 'Gone',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'Payload Too Large',
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: 'Unsupported Media Type',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [HttpStatus.NOT_IMPLEMENTED]: 'Not Implemented',
  [HttpStatus.BAD_GATEWAY]: 'Bad Gateway',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
  [HttpStatus.GATEWAY_TIMEOUT]: 'Gateway Timeout',
};

const TRANSLATED_ERRORS: Record<number, string> = {
  400: 'Requisição inválida',
  401: 'Acesso não autorizado',
  403: 'Acesso negado',
  404: 'Recurso não encontrado',
  409: 'Conflito de dados',
  422: 'Dados não processáveis',
  429: 'Muitas requisições',
};

const TRANSLATED_DETAILS: Record<number, string> = {
  400: 'Os dados enviados estão incorretos. Verifique e tente novamente.',
  401: 'Sua sessão pode ter expirado. Faça login novamente.',
  403: 'Você não possui permissão para realizar esta ação.',
  404: 'O item solicitado não foi encontrado ou já foi removido.',
  409: 'Esta operação conflita com dados existentes no sistema.',
  422: 'Os dados enviados não puderam ser processados.',
  429: 'Aguarde um momento antes de tentar novamente.',
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const body = this.buildResponseBody(exception);

    response.status(body.statusCode).json(body);
  }

  private buildResponseBody(exception: unknown): ErrorResponseBody {
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }

    if (this.isPrismaKnownError(exception)) {
      return this.handlePrismaError(exception);
    }

    return this.handleGenericError(exception);
  }

  private handleHttpException(exception: HttpException): ErrorResponseBody {
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Case 1: Response body is an object with a message array (ValidationPipe)
    if (this.isValidationResponse(exceptionResponse)) {
      return {
        success: false,
        erro: 'Os dados enviados possuem erros de validação',
        detalhes: 'Verifique os campos destacados abaixo e tente novamente.',
        mensagens: exceptionResponse.message,
        statusCode,
      };
    }

    // Determine the actual message string
    const message = exception.message;

    // Case 2 vs 3: Check if the message is a "default" HTTP status text
    const isDefault = DEFAULT_STATUS_TEXTS[statusCode] === message;

    if (isDefault) {
      // Case 3: Default message — use Portuguese translations
      return {
        success: false,
        erro: TRANSLATED_ERRORS[statusCode] ?? 'Erro no servidor',
        detalhes:
          TRANSLATED_DETAILS[statusCode] ??
          'Ocorreu um erro inesperado. Tente novamente mais tarde.',
        mensagens: [],
        statusCode,
      };
    }

    // Case 2: Custom message from services
    return {
      success: false,
      erro: message,
      detalhes:
        TRANSLATED_DETAILS[statusCode] ??
        'Ocorreu um erro inesperado. Tente novamente mais tarde.',
      mensagens: [],
      statusCode,
    };
  }

  private handlePrismaError(
    exception: PrismaClientKnownRequestError,
  ): ErrorResponseBody {
    switch (exception.code) {
      case 'P2002': {
        const target = exception.meta?.['target'];
        const mensagens: string[] = Array.isArray(target)
          ? (target as string[])
          : [];

        return {
          success: false,
          erro: 'Registro duplicado',
          detalhes: 'Já existe um registro com estes dados.',
          mensagens,
          statusCode: HttpStatus.BAD_REQUEST,
        };
      }

      case 'P2003':
        return {
          success: false,
          erro: 'Referência inválida',
          detalhes: 'O registro referenciado não existe ou foi removido.',
          mensagens: [],
          statusCode: HttpStatus.BAD_REQUEST,
        };

      case 'P2025':
        return {
          success: false,
          erro: 'Registro não encontrado',
          detalhes: 'O registro solicitado não existe ou já foi removido.',
          mensagens: [],
          statusCode: HttpStatus.NOT_FOUND,
        };

      default:
        console.error('[Prisma Error]', exception.code, exception.message);
        return {
          success: false,
          erro: 'Erro interno do servidor',
          detalhes:
            'Ocorreu um erro inesperado. Se o problema persistir, entre em contato com o suporte.',
          mensagens: [],
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        };
    }
  }

  private handleGenericError(exception: unknown): ErrorResponseBody {
    console.error('[Unhandled Exception]', exception);

    return {
      success: false,
      erro: 'Erro interno do servidor',
      detalhes:
        'Ocorreu um erro inesperado. Se o problema persistir, entre em contato com o suporte.',
      mensagens: [],
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }

  /** Type guard for PrismaClientKnownRequestError. */
  private isPrismaKnownError(
    error: unknown,
  ): error is PrismaClientKnownRequestError {
    return error instanceof PrismaClientKnownRequestError;
  }

  /** Type guard for validation responses (object with message as string[]). */
  private isValidationResponse(
    response: string | object,
  ): response is { message: string[] } {
    return (
      typeof response === 'object' &&
      response !== null &&
      'message' in response &&
      Array.isArray(response.message)
    );
  }
}
