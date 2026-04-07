import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SphereTab } from '../../history/balance.service';

@Component({
  selector: 'app-sphere-debug-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sphere-debug-panel.component.html',
  styleUrl: './sphere-debug-panel.component.scss'
})
export class SphereDebugPanelComponent {
  @Input() coordinates: Array<{ tab: SphereTab; top: number; left: number; isDragging: boolean }> = [];
}
