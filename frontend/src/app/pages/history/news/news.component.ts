import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalanceService } from '../balance.service';
import { I18nService } from '../../../core/i18n.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss'
})
export class NewsComponent {
  @Input() isFullView = false;
  @Input() panelAnchorBottom = 0;
  @Output() onSelect = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();
  readonly news$;
  readonly unreadCount$;
  readonly orbitSegments$;

  constructor(
    private readonly balanceService: BalanceService,
    private readonly i18nService: I18nService
  ) {
    this.news$ = this.balanceService.news$;
    this.unreadCount$ = this.news$.pipe(map((items) => items.filter((item) => !item.isRead).length));
    this.orbitSegments$ = this.unreadCount$.pipe(
      map((count) => Array.from({ length: Math.max(1, Math.min(18, count || 1)) }, (_, index) => index))
    );
  }

  handleCircleClick(): void {
    if (this.isFullView) {
      return;
    }

    this.onSelect.emit();
  }

  handleClose(event: Event): void {
    event.stopPropagation();
    this.onClose.emit();
  }

  t(key: string): string {
    return this.i18nService.t(key);
  }
}
