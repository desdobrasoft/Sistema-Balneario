import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

/** TODOs:
 * - Implementar desalocamento de placas
 */

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aumenta o limite para payloads JSON
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // Configuração global de validação para ajudar no debug
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Habilita CORS
  app.enableCors({
    origin: true, // Permite qualquer origem em desenvolvimento, ou você pode especificar: ['http://localhost:5173']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
