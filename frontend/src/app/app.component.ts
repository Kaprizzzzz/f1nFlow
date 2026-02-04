import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterOutlet } from '@angular/router'; // Додай це, щоб бачити сторінки!

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet], // RouterOutlet потрібен для роботи роутингу
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
 
  ngOnInit(): void {
    // Тут буде ініціалізація, якщо знадобиться
  }
}