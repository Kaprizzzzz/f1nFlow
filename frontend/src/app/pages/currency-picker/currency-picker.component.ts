 import { CommonModule } from '@angular/common';
 import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
 import { Subscription } from 'rxjs';
 import { BalanceService } from '../history/balance.service';
 
 type Currency = 'EUR' | 'USD' | 'UAH';
 
 @Component({
   selector: 'app-currency-picker',
   standalone: true,
   imports: [CommonModule],
   templateUrl: './currency-picker.component.html',
   styleUrl: './currency-picker.component.scss'
 })
 export class CurrencyPickerComponent implements OnInit, OnDestroy {
   isOpen = false;

   readonly currencies: readonly Currency[] = ['EUR', 'USD', 'UAH'];
   selectedCurrency: Currency = 'EUR';
 
  private subscription = new Subscription();

  constructor(private balanceService: BalanceService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.balanceService.currency$.subscribe((currency) => {
        this.selectedCurrency = currency;
      })
    );
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
    this.balanceService.setCurrency(currency);
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
