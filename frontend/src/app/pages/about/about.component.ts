import { Component } from '@angular/core';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  constructor(private readonly i18nService: I18nService) {}

  private readonly tips: Record<string, string[]> = {
    uk: [
      'Записуй навіть дрібні витрати — саме вони найчастіше “з’їдають” бюджет.',
      'Перевіряй вкладку Goals щодня, щоб бачити темп витрат.',
      'Спробуй встановити тижневий ліміт для найактивнішої категорії.'
    ],
    ru: [
      'Записывай даже мелкие траты — именно они чаще всего “съедают” бюджет.',
      'Проверяй вкладку Goals ежедневно, чтобы контролировать темп расходов.',
      'Попробуй установить недельный лимит для самой активной категории.'
    ],
    en: [
      'Track even tiny expenses — they usually have the biggest hidden impact.',
      'Open Goals daily to keep your spending pace under control.',
      'Set a weekly cap for your most active category to save faster.'
    ]
  };

  get tip(): string {
    const lang = this.i18nService.language;
    const source = this.tips[lang] ?? this.tips['en'];
    const daySeed = new Date().getTime() + Math.floor(Math.random() * 10);
    return source[daySeed % source.length];
  }
}
