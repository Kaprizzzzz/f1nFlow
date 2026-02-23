import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

// Виносимо тип для зручності
type Currency = 'EUR' | 'USD' | 'UAH';

@Component({
  selector: 'app-currency-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-picker.component.html',
  styleUrl: './currency-picker.component.scss'
})
export class CurrencyPickerComponent {
  isOpen = false;

  readonly currencies: readonly Currency[] = ['EUR', 'USD', 'UAH'];
  
  // Явно вказуємо тип Currency, щоб вона могла змінюватися
  selectedCurrency: Currency = 'EUR';

  get secondaryCurrencies() {
    return this.currencies.filter((item) => item !== this.selectedCurrency);
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  pick(currency: Currency): void {
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