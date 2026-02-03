import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  // Переконайся, що файл називається loading.component.html, як у папці
  templateUrl: './loading.component.html', 
  styleUrl: './loading.component.scss',
})
export class LoadingComponent implements OnInit {
  
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Тимчасова логіка для тесту: через 3 секунди перекидаємо на головну
    setTimeout(() => {
      this.router.navigate(['/main']);
    }, 3000);
  }
}