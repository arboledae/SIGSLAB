import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dns from 'dns';

// Force DNS resolution to prefer IPv4 over IPv6.
// This fixes the ENETUNREACH error on hosts like Render which do not support outbound IPv6.
if (dns && typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend requests
  app.enableCors();

  // Set global API prefix
  app.setGlobalPrefix('api');

  await app.listen(3000);
}
bootstrap();
