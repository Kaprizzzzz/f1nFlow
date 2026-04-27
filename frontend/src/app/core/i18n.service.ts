import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppLanguage = 'uk' | 'en' | 'ru' | 'es' | 'be' | 'fr' | 'nl';

type TranslationKey =
  | 'nav.main'
  | 'nav.goals'
  | 'nav.referrals'
  | 'nav.about'
  | 'lang.modalTitle'
  | 'lang.modalSubtitle'
  | 'lang.current'
  | 'lang.select'
  | 'lang.cancel'
  | 'tips.title'
  | 'tips.subtitle'
  | 'tips.step1'
  | 'tips.step2'
  | 'tips.step3'
  | 'tips.next'
  | 'tips.gotIt'
  | 'tips.skip'
  | 'tips.back'
  | 'tab.news'
  | 'tab.recent'
  | 'tab.savings'
  | 'panel.closeNews'
  | 'panel.closeRecent'
  | 'panel.closeHistory'
  | 'recent.quickCount'
  | 'recent.empty'
  | 'recent.transactionsCount'
  | 'recent.total'
  | 'recent.repeatLatest'
  | 'recent.payment'
  | 'recent.repeat'
  | 'saving.historyTitle'
  | 'saving.income'
  | 'saving.expense'
  | 'saving.delete'
  | 'saving.noRecords'
  | 'news.empty'
  | 'main.weeklyChallenge'
  | 'main.challengeSpendLess'
  | 'main.challengeNoSpendingDay'
  | 'main.streakCurrent'
  | 'main.streakBest'
  | 'main.days'
  | 'main.badges'
  | 'main.weeklyMissions'
  | 'badge.locked';

export interface LanguageOption {
  code: AppLanguage;
  flag: string;
  nativeName: string;
}

const TRANSLATIONS: Record<AppLanguage, Record<TranslationKey, string>> = {
  uk: {
    'nav.main': 'Головна',
    'nav.goals': 'Цілі',
    'nav.referrals': 'Реферали',
    'nav.about': 'Про нас',
    'lang.modalTitle': 'Оберіть мову',
    'lang.modalSubtitle': 'Інтерфейс буде перекладено одразу після вибору.',
    'lang.current': 'Поточна мова',
    'lang.select': 'Мова для переходу',
    'lang.cancel': 'Скасувати',
    'tips.title': 'Швидкий старт',
    'tips.subtitle': 'Короткі підказки, щоб швидше освоїтись.',
    'tips.step1': 'Натисни на сферу, щоб відкрити детальну панель категорії.',
    'tips.step2': 'У режимі редагування можна перетягувати сфери та зберігати власний макет.',
    'tips.step3': 'Ліміт швидких транзакцій і валюта зберігаються автоматично.',
    'tips.next': 'Далі',
    'tips.gotIt': 'Зрозуміло',
    'tips.skip': 'Пропустити',
    'tips.back': 'Назад',
    'tab.news': 'Новини',
    'tab.recent': 'Останні',
    'tab.savings': 'Заощадження',
    'panel.closeNews': 'Закрити панель новин',
    'panel.closeRecent': 'Закрити панель останнього',
    'panel.closeHistory': 'Закрити панель історії',
    'recent.quickCount': 'Швидкі транзакції',
    'recent.empty': 'Поки немає статистики витрат',
    'recent.transactionsCount': 'транзакцій',
    'recent.total': 'усього',
    'recent.repeatLatest': 'Повторити останній платіж',
    'recent.payment': 'Платіж',
    'recent.repeat': 'Повторити',
    'saving.historyTitle': 'Історія доходів / витрат / різниці',
    'saving.income': 'Дохід',
    'saving.expense': 'Витрати',
    'saving.delete': 'Видалити',
    'saving.noRecords': 'Поки немає записів.',
    'news.empty': 'Персональні інсайти зʼявляться після активності.',
    'main.weeklyChallenge': 'Тижневий челендж',
    'main.challengeSpendLess': 'Витратити вдвічі менше денного ліміту до дедлайну',
    'main.challengeNoSpendingDay': 'Зробити щонайменше 1 день без витрат',
    'main.streakCurrent': 'Поточний стрік',
    'main.streakBest': 'Найкращий стрік',
    'main.days': 'днів',
    'main.badges': 'Бейджі',
    'main.weeklyMissions': 'Тижневі місії',
    'badge.locked': 'Заблоковано'
  },
  en: {
    'nav.main': 'Main',
    'nav.goals': 'Goals',
    'nav.referrals': 'Referrals',
    'nav.about': 'About',
    'lang.modalTitle': 'Choose language',
    'lang.modalSubtitle': 'The interface updates right after selection.',
    'lang.current': 'Current language',
    'lang.select': 'Switch to',
    'lang.cancel': 'Cancel',
    'tips.title': 'Quick start',
    'tips.subtitle': 'A few hints to get comfortable faster.',
    'tips.step1': 'Tap any sphere to open the category details panel.',
    'tips.step2': 'In edit mode you can drag spheres and save your own layout.',
    'tips.step3': 'Quick transaction limit and currency are saved automatically.',
    'tips.next': 'Next',
    'tips.gotIt': 'Got it',
    'tips.skip': 'Skip',
    'tips.back': 'Back',
    'tab.news': 'News',
    'tab.recent': 'Recent',
    'tab.savings': 'Savings',
    'panel.closeNews': 'Close news panel',
    'panel.closeRecent': 'Close recent panel',
    'panel.closeHistory': 'Close history panel',
    'recent.quickCount': 'Quick tx count',
    'recent.empty': 'No expense stats yet',
    'recent.transactionsCount': 'transactions',
    'recent.total': 'total',
    'recent.repeatLatest': 'Repeat latest payment',
    'recent.payment': 'Payment',
    'recent.repeat': 'Repeat',
    'saving.historyTitle': 'Income / Expense / Difference history',
    'saving.income': 'Income',
    'saving.expense': 'Expense',
    'saving.delete': 'Delete',
    'saving.noRecords': 'No records yet.',
    'news.empty': 'Personal insights appear after your activity.',
    'main.weeklyChallenge': 'Weekly challenge',
    'main.challengeSpendLess': 'Spend 2x less than your daily limit before deadline',
    'main.challengeNoSpendingDay': 'Complete at least 1 no-spend day',
    'main.streakCurrent': 'Current streak',
    'main.streakBest': 'Best streak',
    'main.days': 'days',
    'main.badges': 'Badges',
    'main.weeklyMissions': 'Weekly missions',
    'badge.locked': 'Locked'
  },
  ru: {
    'nav.main': 'Главная',
    'nav.goals': 'Цели',
    'nav.referrals': 'Рефералы',
    'nav.about': 'О нас',
    'lang.modalTitle': 'Выберите язык',
    'lang.modalSubtitle': 'Интерфейс обновится сразу после выбора.',
    'lang.current': 'Текущий язык',
    'lang.select': 'Переключить на',
    'lang.cancel': 'Отмена',
    'tips.title': 'Быстрый старт',
    'tips.subtitle': 'Короткие подсказки для быстрого старта.',
    'tips.step1': 'Нажмите на сферу, чтобы открыть подробную панель категории.',
    'tips.step2': 'В режиме редактирования можно перетаскивать сферы и сохранять свой макет.',
    'tips.step3': 'Лимит быстрых транзакций и валюта сохраняются автоматически.',
    'tips.next': 'Далее',
    'tips.gotIt': 'Понятно',
    'tips.skip': 'Пропустить',
    'tips.back': 'Назад',
    'tab.news': 'Новости',
    'tab.recent': 'Недавние',
    'tab.savings': 'Сбережения',
    'panel.closeNews': 'Закрыть панель новостей',
    'panel.closeRecent': 'Закрыть панель недавнего',
    'panel.closeHistory': 'Закрыть панель истории',
    'recent.quickCount': 'Быстрые транзакции',
    'recent.empty': 'Пока нет статистики расходов',
    'recent.transactionsCount': 'транзакций',
    'recent.total': 'всего',
    'recent.repeatLatest': 'Повторить последний платёж',
    'recent.payment': 'Платёж',
    'recent.repeat': 'Повторить',
    'saving.historyTitle': 'История доходов / расходов / разницы',
    'saving.income': 'Доход',
    'saving.expense': 'Расход',
    'saving.delete': 'Удалить',
    'saving.noRecords': 'Пока нет записей.',
    'news.empty': 'Персональные инсайты появятся после активности.',
    'main.weeklyChallenge': 'Недельный челлендж',
    'main.challengeSpendLess': 'Потратить вдвое меньше дневного лимита до дедлайна',
    'main.challengeNoSpendingDay': 'Сделать минимум 1 день без трат',
    'main.streakCurrent': 'Текущий стрик',
    'main.streakBest': 'Лучший стрик',
    'main.days': 'дней',
    'main.badges': 'Бейджи',
    'main.weeklyMissions': 'Недельные миссии',
    'badge.locked': 'Заблокировано'
  },
  es: {
    'nav.main': 'Inicio',
    'nav.goals': 'Metas',
    'nav.referrals': 'Referidos',
    'nav.about': 'Acerca de',
    'lang.modalTitle': 'Elige idioma',
    'lang.modalSubtitle': 'La interfaz se traduce justo después de elegir.',
    'lang.current': 'Idioma actual',
    'lang.select': 'Cambiar a',
    'lang.cancel': 'Cancelar',
    'tips.title': 'Inicio rápido',
    'tips.subtitle': 'Consejos breves para empezar más rápido.',
    'tips.step1': 'Toca una esfera para abrir el panel detallado de categoría.',
    'tips.step2': 'En modo edición puedes mover esferas y guardar tu diseño.',
    'tips.step3': 'El límite rápido y la moneda se guardan automáticamente.',
    'tips.next': 'Siguiente',
    'tips.gotIt': 'Entendido',
    'tips.skip': 'Omitir',
    'tips.back': 'Atrás'
  },
  be: {
    'nav.main': 'Галоўная',
    'nav.goals': 'Мэты',
    'nav.referrals': 'Рэфералы',
    'nav.about': 'Пра нас',
    'lang.modalTitle': 'Абярыце мову',
    'lang.modalSubtitle': 'Інтэрфейс абновіцца адразу пасля выбару.',
    'lang.current': 'Бягучая мова',
    'lang.select': 'Пераключыць на',
    'lang.cancel': 'Скасаваць',
    'tips.title': 'Хуткі старт',
    'tips.subtitle': 'Кароткія падказкі для пачатку працы.',
    'tips.step1': 'Націсніце на сферу, каб адкрыць дэталёвую панэль катэгорыі.',
    'tips.step2': 'У рэжыме рэдагавання можна перацягваць сферы і захоўваць уласны макет.',
    'tips.step3': 'Ліміт хуткіх транзакцый і валюта захоўваюцца аўтаматычна.',
    'tips.next': 'Далей',
    'tips.gotIt': 'Зразумела',
    'tips.skip': 'Прапусціць',
    'tips.back': 'Назад'
  },
  fr: {
    'nav.main': 'Accueil',
    'nav.goals': 'Objectifs',
    'nav.referrals': 'Parrainages',
    'nav.about': 'À propos',
    'lang.modalTitle': 'Choisir la langue',
    'lang.modalSubtitle': 'L’interface se met à jour juste après la sélection.',
    'lang.current': 'Langue actuelle',
    'lang.select': 'Passer à',
    'lang.cancel': 'Annuler',
    'tips.title': 'Démarrage rapide',
    'tips.subtitle': 'Quelques conseils pour commencer plus vite.',
    'tips.step1': 'Touchez une sphère pour ouvrir le panneau détaillé de catégorie.',
    'tips.step2': 'En mode édition, vous pouvez déplacer les sphères et enregistrer votre disposition.',
    'tips.step3': 'La limite rapide et la devise sont enregistrées automatiquement.',
    'tips.next': 'Suivant',
    'tips.gotIt': 'Compris',
    'tips.skip': 'Passer',
    'tips.back': 'Retour'
  },
  nl: {
    'nav.main': 'Start',
    'nav.goals': 'Doelen',
    'nav.referrals': 'Verwijzingen',
    'nav.about': 'Over',
    'lang.modalTitle': 'Kies taal',
    'lang.modalSubtitle': 'De interface wordt direct vertaald na je keuze.',
    'lang.current': 'Huidige taal',
    'lang.select': 'Schakel naar',
    'lang.cancel': 'Annuleren',
    'tips.title': 'Snelle start',
    'tips.subtitle': 'Korte tips om sneller op weg te zijn.',
    'tips.step1': 'Tik op een sfeer om het detailpaneel van de categorie te openen.',
    'tips.step2': 'In bewerkmodus kun je sferen verslepen en je eigen lay-out opslaan.',
    'tips.step3': 'Snellimiet en valuta worden automatisch opgeslagen.',
    'tips.next': 'Volgende',
    'tips.gotIt': 'Begrepen',
    'tips.skip': 'Overslaan',
    'tips.back': 'Terug'
  }
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly languageSubject = new BehaviorSubject<AppLanguage>('en');

  readonly language$ = this.languageSubject.asObservable();

  readonly options: LanguageOption[] = [
    { code: 'uk', flag: '🇺🇦', nativeName: 'Українська' },
    { code: 'en', flag: '🇺🇸', nativeName: 'English' },
    { code: 'ru', flag: '🇷🇺', nativeName: 'Русский' },
    { code: 'es', flag: '🇪🇸', nativeName: 'Español' },
    { code: 'be', flag: '🇧🇾', nativeName: 'Беларуская' },
    { code: 'fr', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'nl', flag: '🇳🇱', nativeName: 'Nederlands' }
  ];

  get language(): AppLanguage {
    return this.languageSubject.value;
  }

  setLanguage(language: AppLanguage): void {
    this.languageSubject.next(language);
  }

  t(key: TranslationKey | string): string {
    const langMap = TRANSLATIONS[this.language] as Record<string, string>;
    const fallbackMap = TRANSLATIONS.en as Record<string, string>;
    return langMap[key] ?? fallbackMap[key] ?? key;
  }

  getLanguageLabel(language: AppLanguage): string {
    return this.options.find((item) => item.code === language)?.nativeName ?? language;
  }
}
