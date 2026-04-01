 import { Module } from '@nestjs/common';
 import { TypeOrmModule } from '@nestjs/typeorm';
 import { UsersService } from '../services/users.service';
 import { UsersController } from '../controllers/users.controller';
 import { User } from '../entities/user.entity';
 import { Transaction } from '../entities/transaction.entity';
import { TelegramInitDataService } from '../services/telegram-init-data.service';
import { UserEngagementService } from '../services/user-engagement.service';
import { AuthGuard } from '../common/guards';
 
 @Module({
  imports: [TypeOrmModule.forFeature([User, Transaction])],
  providers: [UsersService, TelegramInitDataService, UserEngagementService, AuthGuard],
  controllers: [UsersController],
  exports: [UsersService]
 })
export class UsersModule {}
