import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '../services/users.service';
import { UsersController } from '../controllers/users.controller';
import { User } from '../entities/user.entity'; // Твоя сутність з UUID

@Module({
  // TypeOrmModule.forFeature реєструє твою таблицю User у цьому модулі
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService], // Твій сервіс з імпортом uuid
  controllers: [UsersController],
  exports: [UsersService], // Дозволяє використовувати UsersService в інших модулях
})
export class UsersModule {}