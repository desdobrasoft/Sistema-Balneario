import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { SlidingTokenInterceptor } from './common/interceptors/sliding-token.interceptor';

/** TODOs:
 * - Implementar desalocamento de placas
 */

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aumenta o limite para payloads JSON
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // Middleware de Cookies
  app.use(cookieParser());

  // Configuração global de validação para ajudar no debug
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtro global de exceções (respostas de erro padronizadas em PT-BR)
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Interceptor global de resposta (envelope { success, data })
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Interceptor global de Sliding Token
  const jwtService = app.get(JwtService);
  app.useGlobalInterceptors(new SlidingTokenInterceptor(jwtService));

  // Habilita CORS
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, x-access-token',
    exposedHeaders: ['x-access-token'],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
