import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

interface WrappedResponse {
  success: true;
  data: unknown;
}

interface AlreadyWrappedResponse {
  success: boolean;
  [key: string]: unknown;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor<
  unknown,
  WrappedResponse | AlreadyWrappedResponse
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<WrappedResponse | AlreadyWrappedResponse> {
    return next.handle().pipe(
      map((data) => {
        // Avoid double-wrapping responses that already have a `success` property
        if (this.isAlreadyWrapped(data)) {
          return data;
        }

        return {
          success: true as const,
          data: data ?? null,
        };
      }),
    );
  }

  /** Check if the response already contains a `success` property. */
  private isAlreadyWrapped(data: unknown): data is AlreadyWrappedResponse {
    return typeof data === 'object' && data !== null && 'success' in data;
  }
}
