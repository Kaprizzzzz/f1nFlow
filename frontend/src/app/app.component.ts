import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'f1nFlow-frontend';

  constructor() {
    this.checkBackendConnection();
  }

  checkBackendConnection(){
    fetch('http://localhost:3000/')
      .then(res => res.json())
      .then(data => {
        console.log('✅ Звʼязок з NestJS встановлено!');
        console.log('Дані:', data);
      })
      .catch(err => {
        console.error('❌ Помилка звʼязку з бекендом:', err);
      });
  }
  
}
