import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SphereTab } from '../../history/balance.service';
import { I18nService } from '../../../core/i18n.service';

@Component({
  selector: 'app-sphere-debug-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sphere-debug-panel.component.html',
  styleUrl: './sphere-debug-panel.component.scss'
})
export class SphereDebugPanelComponent {
  @Input() coordinates: Array<{ tab: SphereTab; top: number; left: number; isDragging: boolean }> = [];

  constructor(private readonly i18nService: I18nService) {}

  t(key: string): string {
    return this.i18nService.t(key);
  }
}
