import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expence', // або 'app-expence'
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expence.component.html', // Перевір назву!
  styleUrls: ['./expence.component.scss']
})
export class ExpenceComponent { // або ExpenceComponent
  @Input() isFullView: boolean = false; // ЦЕ ВИПРАВЛЯЄ NG8002
  @Output() onSelect = new EventEmitter<void>();

  handleCircleClick() {
    this.onSelect.emit();
  }
}