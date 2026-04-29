import { Component } from '@angular/core';
import { AppLanguage, I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  constructor(private readonly i18nService: I18nService) {}

  private readonly tips: Record<AppLanguage, string[]> = {
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
    ],
    es: [
      'Registra incluso los gastos pequeños: suelen tener el mayor impacto oculto.',
      'Revisa Goals cada día para mantener el ritmo de gasto bajo control.',
      'Define un límite semanal para tu categoría más activa y ahorra más rápido.'
    ],
    be: [
      'Запісвайце нават дробныя выдаткі — менавіта яны часта незаўважна “з’ядаюць” бюджэт.',
      'Правярайце ўкладку Goals штодня, каб кантраляваць тэмп выдаткаў.',
      'Усталюйце тыднёвы ліміт для самай актыўнай катэгорыі, каб хутчэй назапашваць.'
    ],
    fr: [
      'Notez même les petites dépenses : ce sont souvent elles qui pèsent le plus sur le budget.',
      'Ouvrez Goals chaque jour pour garder votre rythme de dépenses sous contrôle.',
      'Fixez un plafond hebdomadaire pour votre catégorie la plus active afin d’épargner plus vite.'
    ],
    nl: [
      'Houd zelfs kleine uitgaven bij — juist die hebben vaak de grootste verborgen impact op je budget.',
      'Open Goals elke dag om je uitgaventempo onder controle te houden.',
      'Stel een wekelijkse limiet in voor je actiefste categorie om sneller te sparen.'
    ]
  };

  get tip(): string {
    const lang = this.i18nService.language;
    const source = this.tips[lang];
    const daySeed = new Date().getTime() + Math.floor(Math.random() * 10);
    return source[daySeed % source.length];
  }
}
