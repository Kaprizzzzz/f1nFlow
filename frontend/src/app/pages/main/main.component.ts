import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  // Перевір, щоб назва файлу була саме main.component.html, як у папці
  templateUrl: './main.component.html', 
  styleUrl: './main.component.scss',
})
export class MainComponent { // Назва класу має бути MainComponent для app.routes.ts
  
  // Тут ми пізніше додамо логіку для твоїх трьох кругів:
  // totalBalance, expenses, savings
}