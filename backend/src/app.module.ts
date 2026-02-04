import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Transaction } from './entities/transaction.entity'; // ДОДАТИ
import { Referral } from './entities/referral.entity';       // ДОДАТИ
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Реєструємо ВСІ сутності, які мають зв'язки між собою
    TypeOrmModule.forFeature([User, Transaction, Referral]), 

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true, 
        synchronize: true,
        ssl: { rejectUnauthorized: false },
      }),
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}