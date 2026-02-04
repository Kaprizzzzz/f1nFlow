import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Повідомляємо компилятору, що Telegram існує в глобальному полі (в index.html)
declare var Telegram: any;

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  // Початкове значення, поки Telegram не завантажиться
  username: string = 'F1N User'; 

  ngOnInit(): void {
    // Перевіряємо, чи доступний об'єкт Telegram
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
      const tg = Telegram.WebApp;

      // Повідомляємо Telegram, що ми завантажились
      tg.ready();
      
      // Розгортаємо додаток на максимум
      tg.expand();

      // Отримуємо дані користувача
      const user = tg.initDataUnsafe?.user;
      if (user) {
        // Пріоритет: username (@nick), якщо немає — First Name
        this.username = user.username ? `@${user.username}` : user.first_name;
      }
    }
  }

  // Функція для кнопки
  onClaim(): void {
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
      // Робимо легку вібрацію при натисканні
      Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
    console.log('Claim button clicked');
  }
}