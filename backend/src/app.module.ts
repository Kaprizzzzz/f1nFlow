import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 1. Ініціалізуємо конфігурацію (зчитує .env)
    ConfigModule.forRoot({ 
      isGlobal: true 
    }),

    // 2. Налаштовуємо підключення до БД
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        // Беремо посилання з файлу .env
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        // synchronize: true автоматично створить таблиці в Supabase на основі ваших Entity
        synchronize: true, 
        ssl: {
          // Важливо для Supabase та інших хмарних БД
          rejectUnauthorized: false,
        },
      }),
    }),

    // 3. Ваші модулі
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}