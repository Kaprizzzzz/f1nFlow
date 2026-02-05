import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-saving', // або 'app-expence'
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saving.component.html', // Перевір назву!
  styleUrls: ['./saving.component.scss']
})
export class SavingComponent { // або ExpenceComponent
  @Input() isFullView: boolean = false; // ЦЕ ВИПРАВЛЯЄ NG8002
  @Output() onSelect = new EventEmitter<void>();

  handleCircleClick() {
    this.onSelect.emit();
  }
}