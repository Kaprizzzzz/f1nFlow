import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomeComponent } from '../../history/income/income.component';
import { ExpenceComponent } from '../../history/expence/expence.component';
import { SavingComponent } from '../../history/saving/saving.component';
import { NewsComponent } from '../../history/news/news.component';

 type MainTab = 'income' | 'expense' | 'saving' | 'news' | null;

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, IncomeComponent, ExpenceComponent, SavingComponent, NewsComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  activeTab: MainTab = null;

  setActiveTab(tab: Exclude<MainTab, null>): void {
    this.activeTab = this.activeTab === tab ? null : tab;
  }
 
  isHidden(tab: Exclude<MainTab, null>): boolean {
    return this.activeTab !== null && this.activeTab !== tab;
  }
}
