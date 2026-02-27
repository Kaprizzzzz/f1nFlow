import { Module } from '@nestjs/common';
 import { TypeOrmModule } from '@nestjs/typeorm';
 import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users.module';
 import { AppController } from './app.controller';
 
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
        synchronize: true,
        ssl: { rejectUnauthorized: false }
      })
     }),
    UsersModule
   ],
  controllers: [AppController]
 })
export class AppModule {}
