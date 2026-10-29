import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable global validation pipe for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`\n=============================================================`);
  console.log(`🚀 NestJS & Prisma Server is running!`);
  console.log(`🌐 Web Viewer & Dashboard:  http://localhost:${port}`);
  console.log(`📡 REST API Base:           http://localhost:${port}/api`);
  console.log(`🗄️  Prisma Studio (GUI):     Run 'npm run prisma:studio' (http://localhost:5555)`);
  console.log(`=============================================================\n`);
}
bootstrap();
