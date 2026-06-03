import { Component } from '@angular/core';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-events',
  imports: [],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss',
})
export class EventsComponent {
  constructor(private readonly i18nService: I18nService) {}

  t(key: string): string {
    return this.i18nService.t(key);
  }
}
