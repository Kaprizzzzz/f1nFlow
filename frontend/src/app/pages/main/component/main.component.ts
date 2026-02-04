import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../user/service/user.service'; // Перевір шлях до сервісу

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  users: any[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        console.log('Користувачі завантажені в Main:', this.users);
      },
      error: (err) => console.error('Помилка в Main:', err)
    });
  }
}