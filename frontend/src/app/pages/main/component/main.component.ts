import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../user/service/user.service';
import { IncomeComponent } from '../../history/income/income.component';
import { ExpenceComponent } from '../../history/expence/expence.component';
import { SavingComponent } from '../../history/saving/saving.component';

declare var Telegram: any;

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, IncomeComponent, ExpenceComponent, SavingComponent],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  userName: string = 'User';
  balance: number = 0;
  activeCategory: 'none' | 'income' | 'expense' | 'saving' = 'none';

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
      const tg = Telegram.WebApp;
      tg.ready();
      const tgUser = tg.initDataUnsafe?.user;
      
      if (tgUser) {
        this.userService.login(tgUser.id.toString(), tgUser.username).subscribe({
          next: (user) => {
            this.userName = user.username || tgUser.username;
            this.balance = user.balance || 0;
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  setCategory(cat: 'income' | 'expense' | 'saving') {
    // Якщо тиснути на вже відкриту — закриваємо
    this.activeCategory = this.activeCategory === cat ? 'none' : cat;
  }
}