import { Component } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { ABOUT_TIPS } from './about.tips';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  constructor(private readonly i18nService: I18nService) {}

  get tip(): string {
    const language = this.i18nService.language;
    const source = ABOUT_TIPS[language] ?? ABOUT_TIPS['en'];
    const randomOffset = Math.floor(Math.random() * 10);
    const tipIndex = (Date.now() + randomOffset) % source.length;
    return source[tipIndex];
  }
}
