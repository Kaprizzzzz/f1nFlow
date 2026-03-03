 import { Module } from '@nestjs/common';
 import { TypeOrmModule } from '@nestjs/typeorm';
 import { UsersService } from '../services/users.service';
 import { UsersController } from '../controllers/users.controller';
 import { User } from '../entities/user.entity';
 import { Transaction } from '../entities/transaction.entity';
 import { TelegramInitDataService } from '../services/telegram-init-data.service';
 
 @Module({
  imports: [TypeOrmModule.forFeature([User, Transaction])],
  providers: [UsersService, TelegramInitDataService],
  controllers: [UsersController],
  exports: [UsersService]
 })
export class UsersModule {}
