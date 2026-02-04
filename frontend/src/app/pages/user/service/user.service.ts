import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Оскільки NestJS працює в Docker на порту 3000
  private apiUrl = 'http://localhost:3000/users'; 

  constructor(private http: HttpClient) {}

  // Метод для отримання всіх користувачів
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Метод для створення нового користувача (знадобиться пізніше для Telegram)
  createUser(userData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData);
  }
}