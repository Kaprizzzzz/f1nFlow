import { Component } from '@angular/core';
import { I18nService } from '../../../core/i18n.service';

@Component({
  selector: 'app-user',
  imports: [],
  templateUrl: './user.html',
  styleUrl: './user.scss',
})
export class User {
  constructor(private readonly i18nService: I18nService) {}

  t(key: string): string {
    return this.i18nService.t(key);
  }
}
