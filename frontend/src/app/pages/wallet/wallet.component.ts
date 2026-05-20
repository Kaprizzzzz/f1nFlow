import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss',
})
export class WalletComponent {
  private readonly i18n = inject(I18nService);
  isConnected = false;
  telegramWalletId = '';

  constructor() {
    if (typeof window === 'undefined') return;
    this.isConnected = localStorage.getItem('wallet-connected') === '1';
    this.telegramWalletId = localStorage.getItem('wallet-telegram-id') ?? '';
  }

  t(key: string): string {
    return this.i18n.t(key as never);
  }

  toggleConnection(): void {
    this.isConnected = !this.isConnected;
    if (typeof window !== 'undefined') {
      localStorage.setItem('wallet-connected', this.isConnected ? '1' : '0');
    }
  }

  connectTelegramWallet(): void {
    const entered =
      typeof window !== 'undefined'
        ? window.prompt(this.t('wallet.telegramPrompt'), this.telegramWalletId)
        : null;
    if (!entered) return;
    this.telegramWalletId = entered.trim();
    this.isConnected = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('wallet-telegram-id', this.telegramWalletId);
      localStorage.setItem('wallet-connected', '1');
    }
  }

  openTelegramWalletBot(): void {
    if (typeof window === 'undefined') return;
    window.open('https://t.me/wallet', '_blank', 'noopener,noreferrer');
  }
}
