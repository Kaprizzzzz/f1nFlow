import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BalanceService } from '../history/balance.service';
import { Currency } from '../history/models/history-shared.models';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-currency-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-picker.component.html',
  styleUrl: './currency-picker.component.scss'
})
export class CurrencyPickerComponent implements OnInit, OnDestroy {
  isOpen = false;

  readonly currencies: readonly Currency[] = ['EUR', 'USD', 'UAH', 'RUB', 'PLN', 'TRY', 'CAD', 'GBP', 'HRK'];
  selectedCurrency: Currency = 'EUR';

  private subscription = new Subscription();

  constructor(
    private balanceService: BalanceService,
    private readonly i18nService: I18nService,
  ) {}

  t(key: string): string {
    return this.i18nService.t(key);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.balanceService.currency$.subscribe((currency) => {
        if (this.currencies.includes(currency)) {
          this.selectedCurrency = currency;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  async pick(currency: Currency): Promise<void> {
    await this.balanceService.setCurrency(currency);
    this.selectedCurrency = currency;
    this.isOpen = false;
  }

  @HostListener('document:click')
  closeOnOutsideClick(): void {
    this.isOpen = false;
  }

  onWrapperClick(event: Event): void {
    event.stopPropagation();
  }
}
