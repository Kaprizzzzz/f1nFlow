import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user.model'; // Імпортуємо модель, яку створили вище

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Коли ми запустимо docker-compose, бекенд буде тут [cite: 2026-01-24]
  private apiUrl = 'http://localhost:3000/users'; 

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
}

export type { User };
