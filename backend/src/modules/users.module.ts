 import { Module } from '@nestjs/common';
 import { TypeOrmModule } from '@nestjs/typeorm';
 import { UsersService } from '../services/users.service';
 import { UsersController } from '../controllers/users.controller';
 import { User } from '../entities/user.entity';
import { Transaction } from '../entities/transaction.entity';
import { Subscription } from '../entities/subscription.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { PaymentEvent } from '../entities/payment-event.entity';
import { ConsentLog } from '../entities/consent-log.entity';
import { SecurityAuditLog } from '../entities/security-audit-log.entity';
import { TelegramInitDataService } from '../services/telegram-init-data.service';
import { UserEngagementService } from '../services/user-engagement.service';
import { AuthGuard } from '../common/guards';
 
 @Module({
  imports: [TypeOrmModule.forFeature([User, Transaction, Subscription, SubscriptionPlan, PaymentEvent, ConsentLog, SecurityAuditLog])],
  providers: [UsersService, TelegramInitDataService, UserEngagementService, AuthGuard],
  controllers: [UsersController],
  exports: [UsersService]
 })
export class UsersModule {}
