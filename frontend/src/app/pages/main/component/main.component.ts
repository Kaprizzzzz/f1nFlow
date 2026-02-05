import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. ChangeDetectorRef тут
import { CommonModule } from '@angular/common';
import { UserService } from '../../user/service/user.service';

// ІМПОРТИ НОВИХ КОМПОНЕНТІВ
import { IncomeComponent } from '../../history/income/income.component';
import { ExpenceComponent } from '../../history/expence/expence.component';
import { SavingComponent } from '../../history/saving/saving.component';

declare var Telegram: any;

@Component({
  selector: 'app-main',
  standalone: true,
  // 2. Всі дочірні компоненти в імпортах
  imports: [CommonModule, IncomeComponent, ExpenceComponent, SavingComponent],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  userName: string = '';
  userUUID: string = '';
  referralCode: string = '';
  balance: number = 0;
  isLoading: boolean = true;
  activeCategory: 'none' | 'income' | 'expense' | 'saving' = 'none';

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef // 3. Ін'єкція тут
  ) {}

  ngOnInit(): void {
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
      const tg = Telegram.WebApp;
      tg.ready();
      tg.expand();

      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser) {
        this.userService.login(tgUser.id.toString(), tgUser.username).subscribe({
          next: (dbUser) => {
            // Гнучке отримання імені
            this.userName = dbUser.userName || dbUser.username || tgUser.username || 'User';
            this.userUUID = dbUser.id;
            this.balance = dbUser.balance || 0;
            this.isLoading = false;
            
            // 4. Примусове оновлення UI
            this.cdr.detectChanges(); 
          },
          error: (err) => {
            console.error('Login error:', err);
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      }
    }
  }
}