import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global API routing prefix
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: true, // Echo origin to support credentials alongside wildcard requests
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Nest.js Server is running on: http://localhost:3000/api`);
}
bootstrap();
