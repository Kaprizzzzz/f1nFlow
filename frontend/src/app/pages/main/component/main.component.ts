// src/app/pages/main/main.component.ts
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../user/service/user.service'; // Перевір шлях до файлу

declare var Telegram: any;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  userName: string = 'Завантаження...';
  userUUID: string = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
      const tg = Telegram.WebApp;
      tg.ready();

      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser) {
        // Відправляємо ID як рядок, бо в Entity це string
        this.userService.login(tgUser.id.toString(), tgUser.username).subscribe({
          next: (dbUser) => {
            this.userName = dbUser.userName;
            this.userUUID = dbUser.id; // Це твій PrimaryGeneratedColumn('uuid')
            console.log('Користувач успішно синхронізований з базою');
          },
          error: (err) => console.error('Помилка авторизації:', err)
        });
      }
    }
  }
  // Додай цей метод сюди:
  onClaim(): void {
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
      // Викликаємо вібровідгук Telegram
      Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
    console.log('Rewards claimed!');
  }
}