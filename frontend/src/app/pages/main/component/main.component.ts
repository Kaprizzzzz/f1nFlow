import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomeComponent } from '../../history/income/income.component';
import { ExpenceComponent } from '../../history/expence/expence.component';
import { SavingComponent } from '../../history/saving/saving.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule, 
    IncomeComponent, 
    ExpenceComponent, 
    SavingComponent
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  // Відстежуємо, яка вкладка зараз активна (розгорнута)
  activeTab: string | null = null;

  setActiveTab(tab: string): void {
    // Якщо клікаємо по вже активній — згортаємо (null), інакше — відкриваємо нову
    this.activeTab = (this.activeTab === tab) ? null : tab;
  }
}