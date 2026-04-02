import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalanceService } from '../balance.service';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss'
})
export class NewsComponent {
  @Input() isFullView = false;
  @Output() onSelect = new EventEmitter<void>();
  readonly news$;

  constructor(private readonly balanceService: BalanceService) {
    this.news$ = this.balanceService.news$;
  }

  handleCircleClick(): void {
    this.onSelect.emit();
  }
}