import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { I18nService } from '../../core/i18n.service';
import { WalletService } from '../../core/wallet.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss',
})
export class WalletComponent implements OnInit, OnDestroy {
  private readonly i18n = inject(I18nService);
  private readonly walletService = inject(WalletService);
  private readonly subscription = new Subscription();

  isConnected = false;
  telegramWalletId = '';
  walletDraft = '';
  connectedAt: string | null = null;
  isSaving = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadWallet();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  t(key: string): string {
    return this.i18n.t(key as never);
  }

  loadWallet(): void {
    this.subscription.add(
      this.walletService.getWallet().subscribe({
        next: (wallet) => {
          this.isConnected = wallet.isConnected;
          this.telegramWalletId = wallet.telegramWalletId ?? '';
          this.walletDraft = this.telegramWalletId;
          this.connectedAt = wallet.connectedAt;
          this.errorMessage = '';
        },
        error: () => {
          this.errorMessage = this.t('wallet.loadError');
        },
      }),
    );
  }

  connectTelegramWallet(): void {
    const nextWallet = this.walletDraft.trim();
    if (!nextWallet) {
      this.errorMessage = this.t('wallet.required');
      return;
    }

    this.isSaving = true;
    this.subscription.add(
      this.walletService.connectTelegramWallet(nextWallet).subscribe({
        next: (wallet) => {
          this.isConnected = wallet.isConnected;
          this.telegramWalletId = wallet.telegramWalletId ?? '';
          this.walletDraft = this.telegramWalletId;
          this.connectedAt = wallet.connectedAt;
          this.isSaving = false;
          this.errorMessage = '';
        },
        error: () => {
          this.isSaving = false;
          this.errorMessage = this.t('wallet.saveError');
        },
      }),
    );
  }

  disconnectTelegramWallet(): void {
    this.isSaving = true;
    this.subscription.add(
      this.walletService.disconnectTelegramWallet().subscribe({
        next: (wallet) => {
          this.isConnected = wallet.isConnected;
          this.telegramWalletId = wallet.telegramWalletId ?? '';
          this.walletDraft = '';
          this.connectedAt = wallet.connectedAt;
          this.isSaving = false;
          this.errorMessage = '';
        },
        error: () => {
          this.isSaving = false;
          this.errorMessage = this.t('wallet.saveError');
        },
      }),
    );
  }

  openTelegramWalletBot(): void {
    if (typeof window === 'undefined') return;
    window.open('https://t.me/wallet', '_blank', 'noopener,noreferrer');
  }
}
