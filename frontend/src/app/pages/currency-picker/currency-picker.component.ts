 import { CommonModule } from '@angular/common';
 import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
 import { Subscription } from 'rxjs';
 import { BalanceService } from '../history/balance.service';
 
import { Currency } from '../history/models/history-shared.models';
 
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
  exchangeRates: Partial<Record<Currency, number>> = {};
 
  private subscription = new Subscription();

  constructor(private balanceService: BalanceService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.balanceService.currency$.subscribe((currency) => {
        this.selectedCurrency = currency;
        void this.loadExchangeRates();
      })
    );

    void this.loadExchangeRates();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

   get secondaryCurrencies() {
     return this.currencies.filter((item) => item !== this.selectedCurrency);
   }
 
   toggle(): void {
     this.isOpen = !this.isOpen;
   }
 
  pick(currency: Currency): void {
    void this.balanceService.setCurrency(currency);
     this.isOpen = false;
   }

  getRateLabel(currency: Currency): string {
    const rate = this.exchangeRates[currency];
    if (!(rate && Number.isFinite(rate) && rate > 0)) {
      return '—';
    }
    return rate.toFixed(4);
  }

  private async loadExchangeRates(): Promise<void> {
    const base = this.selectedCurrency;
    const rates: Partial<Record<Currency, number>> = { [base]: 1 };

    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
      if (!response.ok) {
        this.exchangeRates = rates;
        return;
      }

      const payload = await response.json() as { rates?: Record<string, number> };
      for (const currency of this.secondaryCurrencies) {
        const nextRate = payload.rates?.[currency] ?? 0;
        rates[currency] = Number.isFinite(nextRate) ? nextRate : 0;
      }
    } catch {
      for (const currency of this.secondaryCurrencies) {
        rates[currency] = 0;
      }
    }

    this.exchangeRates = rates;
  }
 
   @HostListener('document:click')
   closeOnOutsideClick(): void {
     this.isOpen = false;
   }
 
   onWrapperClick(event: Event): void {
     event.stopPropagation();
   }
}
