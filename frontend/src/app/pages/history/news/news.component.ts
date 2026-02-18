import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  handleCircleClick(): void {
    this.onSelect.emit();
  }
}