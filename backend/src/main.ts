import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Дозволяємо фронтенду (і будь-кому іншому) звертатися до нашого API
  app.enableCors();
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
