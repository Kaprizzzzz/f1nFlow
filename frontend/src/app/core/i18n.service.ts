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
    'tips.back': 'Atrás',
    'tab.news': 'Noticias',
    'tab.recent': 'Recientes',
    'tab.savings': 'Ahorros',
    'panel.closeNews': 'Cerrar panel de noticias',
    'panel.closeRecent': 'Cerrar panel de recientes',
    'panel.closeHistory': 'Cerrar panel de historial',
    'recent.quickCount': 'Transacciones rápidas',
    'recent.empty': 'Aún no hay estadísticas de gastos',
    'recent.transactionsCount': 'transacciones',
    'recent.total': 'total',
    'recent.repeatLatest': 'Repetir último pago',
    'recent.payment': 'Pago',
    'recent.repeat': 'Repetir',
    'saving.historyTitle': 'Historial de ingresos / gastos / diferencia',
    'saving.income': 'Ingreso',
    'saving.expense': 'Gasto',
    'saving.delete': 'Eliminar',
    'saving.noRecords': 'Aún no hay registros.',
    'news.empty': 'Los insights personales aparecerán después de tu actividad.',
    'main.weeklyChallenge': 'Desafío semanal',
    'main.challengeSpendLess': 'Gastar 2x menos que tu límite diario antes del plazo',
    'main.challengeNoSpendingDay': 'Completar al menos 1 día sin gastos',
    'main.streakCurrent': 'Racha actual',
    'main.streakBest': 'Mejor racha',
    'main.days': 'días',
    'main.badges': 'Insignias',
    'main.weeklyMissions': 'Misiones semanales',
    'badge.locked': 'Bloqueado'
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
    'tips.back': 'Назад',
    'tab.news': 'Навіны',
    'tab.recent': 'Апошнія',
    'tab.savings': 'Зберажэнні',
    'panel.closeNews': 'Закрыць панэль навін',
    'panel.closeRecent': 'Закрыць панэль апошняга',
    'panel.closeHistory': 'Закрыць панэль гісторыі',
    'recent.quickCount': 'Хуткія транзакцыі',
    'recent.empty': 'Пакуль няма статыстыкі выдаткаў',
    'recent.transactionsCount': 'транзакцый',
    'recent.total': 'усяго',
    'recent.repeatLatest': 'Паўтарыць апошні плацеж',
    'recent.payment': 'Плацеж',
    'recent.repeat': 'Паўтарыць',
    'saving.historyTitle': 'Гісторыя даходаў / выдаткаў / розніцы',
    'saving.income': 'Даход',
    'saving.expense': 'Выдаткі',
    'saving.delete': 'Выдаліць',
    'saving.noRecords': 'Пакуль няма запісаў.',
    'news.empty': 'Персанальныя інсайты зʼявяцца пасля актыўнасці.',
    'main.weeklyChallenge': 'Тыднёвы чэлендж',
    'main.challengeSpendLess': 'Патраціць у 2 разы менш за дзённы ліміт да дэдлайну',
    'main.challengeNoSpendingDay': 'Зрабіць мінімум 1 дзень без выдаткаў',
    'main.streakCurrent': 'Бягучы стрык',
    'main.streakBest': 'Найлепшы стрык',
    'main.days': 'дзён',
    'main.badges': 'Бэйджы',
    'main.weeklyMissions': 'Тыднёвыя місіі',
    'badge.locked': 'Заблакавана'
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
    'tips.back': 'Retour',
    'tab.news': 'Actualités',
    'tab.recent': 'Récents',
    'tab.savings': 'Épargne',
    'panel.closeNews': 'Fermer le panneau actualités',
    'panel.closeRecent': 'Fermer le panneau des récents',
    'panel.closeHistory': 'Fermer le panneau historique',
    'recent.quickCount': 'Transactions rapides',
    'recent.empty': 'Aucune statistique de dépenses pour le moment',
    'recent.transactionsCount': 'transactions',
    'recent.total': 'total',
    'recent.repeatLatest': 'Répéter le dernier paiement',
    'recent.payment': 'Paiement',
    'recent.repeat': 'Répéter',
    'saving.historyTitle': 'Historique revenus / dépenses / différence',
    'saving.income': 'Revenu',
    'saving.expense': 'Dépense',
    'saving.delete': 'Supprimer',
    'saving.noRecords': 'Aucun enregistrement pour le moment.',
    'news.empty': 'Les insights personnels apparaissent après votre activité.',
    'main.weeklyChallenge': 'Défi hebdomadaire',
    'main.challengeSpendLess': 'Dépenser 2x moins que votre limite quotidienne avant l’échéance',
    'main.challengeNoSpendingDay': 'Faire au moins 1 journée sans dépenses',
    'main.streakCurrent': 'Série actuelle',
    'main.streakBest': 'Meilleure série',
    'main.days': 'jours',
    'main.badges': 'Badges',
    'main.weeklyMissions': 'Missions hebdomadaires',
    'badge.locked': 'Verrouillé'
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
    'tips.back': 'Terug',
    'tab.news': 'Nieuws',
    'tab.recent': 'Recent',
    'tab.savings': 'Besparingen',
    'panel.closeNews': 'Sluit nieuwspaneel',
    'panel.closeRecent': 'Sluit recent-paneel',
    'panel.closeHistory': 'Sluit geschiedenispaneel',
    'recent.quickCount': 'Snelle transacties',
    'recent.empty': 'Nog geen uitgavenstatistieken',
    'recent.transactionsCount': 'transacties',
    'recent.total': 'totaal',
    'recent.repeatLatest': 'Herhaal laatste betaling',
    'recent.payment': 'Betaling',
    'recent.repeat': 'Herhalen',
    'saving.historyTitle': 'Geschiedenis inkomsten / uitgaven / verschil',
    'saving.income': 'Inkomsten',
    'saving.expense': 'Uitgaven',
    'saving.delete': 'Verwijderen',
    'saving.noRecords': 'Nog geen records.',
    'news.empty': 'Persoonlijke inzichten verschijnen na je activiteit.',
    'main.weeklyChallenge': 'Wekelijkse uitdaging',
    'main.challengeSpendLess': 'Geef 2x minder uit dan je daglimiet vóór de deadline',
    'main.challengeNoSpendingDay': 'Voltooi minstens 1 dag zonder uitgaven',
    'main.streakCurrent': 'Huidige reeks',
    'main.streakBest': 'Beste reeks',
    'main.days': 'dagen',
    'main.badges': 'Badges',
    'main.weeklyMissions': 'Wekelijkse missies',
    'badge.locked': 'Vergrendeld'
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
