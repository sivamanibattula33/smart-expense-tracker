import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  // Load mkcert certificates for HTTPS if they exist
  const certPath = path.resolve(process.cwd(), 'localhost+2.pem');
  const keyPath = path.resolve(process.cwd(), 'localhost+2-key.pem');
  const httpsOptions = fs.existsSync(certPath) && fs.existsSync(keyPath)
    ? { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) }
    : undefined;

  const app = await NestFactory.create(AppModule, httpsOptions ? { httpsOptions } : {});

  app.use(helmet());

  const allowedOrigins = [
    'http://localhost:5173',
    'https://localhost:5173',
    'https://smart-expense-tracker-lilac.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  const protocol = httpsOptions ? 'https' : 'http';
  console.log(`\n🚀 Backend running on ${protocol}://10.235.165.112:3000`);
  console.log(`   Also accessible at ${protocol}://localhost:3000\n`);
}
bootstrap().catch(err => console.error(err));

