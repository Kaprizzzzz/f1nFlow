import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LoadingComponent } from './pages/loading/loading.component'; // Перевір шлях

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    LoadingComponent // Додаємо компонент заставки
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  showSplash = true; // Стан для стартового екрана

  ngOnInit(): void {
    // Екрануємо заставку через 2.5 секунди
    setTimeout(() => {
      this.showSplash = false;
    }, 2500);
  }
}