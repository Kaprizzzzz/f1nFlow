import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { UserService, User } from './user/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule], // Це виправить помилку NG0303
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  users: User[] = []; // Початковий порожній масив

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        console.log('Дані з бекенду:', data);
        // ПЕРЕВІРКА: якщо прийшов не масив, робимо його порожнім
        this.users = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Помилка звʼязку з Docker-бекендом:', err);
        this.users = [];
      }
    });
  }
}