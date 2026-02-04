import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users.module'; 
import { AppController } from './app.controller';
import { User } from './entities/user.entity'; //
import { Transaction } from './entities/transaction.entity'; 
import { Referral } from './entities/referral.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true, 
        synchronize: true, // Автоматично створює таблиці в БД
        ssl: { rejectUnauthorized: false },
      }),
    }),

    // Важливо: додаємо User сюди, щоб AppController мав доступ до бази
    TypeOrmModule.forFeature([User, Transaction, Referral]), 

    UsersModule, 
  ],
  controllers: [AppController],
})
export class AppModule {}