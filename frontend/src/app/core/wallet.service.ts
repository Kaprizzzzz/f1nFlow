import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TelegramWalletDto {
  telegramWalletId: string | null;
  isConnected: boolean;
  connectedAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getWallet(): Observable<TelegramWalletDto> {
    return this.http.get<TelegramWalletDto>(`${this.apiUrl}/users/me/wallet`);
  }

  connectTelegramWallet(
    telegramWalletId: string,
  ): Observable<TelegramWalletDto> {
    return this.http.put<TelegramWalletDto>(`${this.apiUrl}/users/me/wallet`, {
      telegramWalletId,
    });
  }

  disconnectTelegramWallet(): Observable<TelegramWalletDto> {
    return this.http.post<TelegramWalletDto>(
      `${this.apiUrl}/users/me/wallet/disconnect`,
      {},
    );
  }
}
