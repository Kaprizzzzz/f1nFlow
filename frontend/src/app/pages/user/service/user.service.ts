import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Твій Ngrok URL з терміналу
  private apiUrl = 'https://e73e-45-89-90-142.ngrok-free.app/users';

  constructor(private http: HttpClient) {}

  login(telegramId: string, userName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { telegramId, userName });
  }
}