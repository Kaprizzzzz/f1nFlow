import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Додали ChangeDetectorRef
import { UserService } from '../../user/service/user.service';
import { CommonModule } from '@angular/common';

declare var Telegram: any;

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  userName: string = '';
  userUUID: string = '';
  referralCode: string = '';
  balance: number = 0;
  isLoading: boolean = true;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef // Ін'єкція для оновлення екрана
  ) {}

  ngOnInit(): void {
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
      const tg = Telegram.WebApp;
      tg.ready();
      tg.expand(); // Розгорнути на весь екран

      const tgUser = tg.initDataUnsafe?.user;
      
      if (tgUser) {
        this.userService.login(tgUser.id.toString(), tgUser.username).subscribe({
          next: (dbUser) => {
            console.log('Дані з сервера:', dbUser);
            
            // ГНУЧКЕ ЗЧИТУВАННЯ: пробуємо всі варіанти назви поля
            this.userName = dbUser.userName || dbUser.username || tgUser.username || 'Користувач';
            this.userUUID = dbUser.id;
            this.referralCode = dbUser.referralCode;
            this.balance = dbUser.balance || 0;
            
            this.isLoading = false;
            this.cdr.detectChanges(); // ПРИМУСОВО ОНОВЛЮЄМО ЕКРАН
          },
          error: (err) => {
            console.error('Помилка авторизації:', err);
            this.userName = tgUser.username; // Якщо бекенд ліг, хоча б покажемо нік з ТГ
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  onClaim(): void {
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
      Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
    this.balance += 10;
  }
}