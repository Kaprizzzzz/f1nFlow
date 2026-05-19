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
  | 'common.cancel'
  | 'common.save'
  | 'common.close'
  | 'common.loading'
  | 'common.invalid'
  | 'main.income'
  | 'main.expense'
  | 'category.create'
  | 'category.createPlaceholder'
  | 'category.editName'
  | 'category.newName'
  | 'category.icon'
  | 'about.title'
  | 'about.description'
  | 'about.telegramChannel'
  | 'about.telegramChat'
  | 'about.instagram'
  | 'about.tiktok'
  | 'about.tip'
  | 'referrals.title'
  | 'referrals.peopleTitle'
  | 'referrals.peopleDescription'
  | 'referrals.joined'
  | 'referrals.emptyInvited'
  | 'referrals.topTitle'
  | 'referrals.topDescription'
  | 'referrals.emptyTop'
  | 'referrals.inviteTitle'
  | 'referrals.inviteDescription'
  | 'referrals.copyLink'
  | 'referrals.copied'
  | 'referrals.shareText'
  | 'badge.locked'
  | 'main.badge.streakBronze'
  | 'main.badge.streakSilver'
  | 'main.badge.streakGold'
  | 'main.badge.challengeWinner';

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
    'tips.step2':
      'У режимі редагування можна перетягувати сфери та зберігати власний макет.',
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
    'main.challengeSpendLess':
      'Витратити вдвічі менше денного ліміту до дедлайну',
    'main.challengeNoSpendingDay': 'Зробити щонайменше 1 день без витрат',
    'main.streakCurrent': 'Поточний стрік',
    'main.streakBest': 'Найкращий стрік',
    'main.days': 'днів',
    'main.badges': 'Бейджі',
    'main.weeklyMissions': 'Тижневі місії',
    'common.cancel': 'Скасувати',
    'common.save': 'Зберегти',
    'common.close': 'Закрити',
    'common.loading': 'Завантаження...',
    'common.invalid': 'Некоректно',
    'main.income': 'Дохід',
    'main.expense': 'Витрати',
    'category.create': 'Створити категорію',
    'category.createPlaceholder': 'Назва категорії',
    'category.editName': 'Редагувати назву категорії',
    'category.newName': 'Нова назва категорії',
    'category.icon': 'Іконка категорії',
    'about.title': 'Про F1nFlow',
    'about.description':
      'F1nFlow допомагає керувати витратами, відстежувати категорії та тримати бюджет під контролем.',
    'about.telegramChannel': 'Telegram-канал',
    'about.telegramChat': 'Telegram-чат',
    'about.instagram': 'Instagram',
    'about.tiktok': 'TikTok',
    'about.tip': 'Порада',
    'referrals.title': 'Реферали',
    'referrals.peopleTitle': 'Люди, яких ти запросив(ла)',
    'referrals.peopleDescription':
      'Це список користувачів, які приєдналися за твоїм реферальним кодом.',
    'referrals.joined': 'Приєднався(лась)',
    'referrals.emptyInvited': 'У тебе ще немає запрошених рефералів.',
    'referrals.topTitle': 'Топ 100 користувачів за рефералами',
    'referrals.topDescription':
      'Рейтинг побудовано лише на реальних реферальних записах з бази даних.',
    'referrals.emptyTop': 'Поки немає даних рейтингу рефералів.',
    'referrals.inviteTitle': 'Твоє персональне посилання-запрошення',
    'referrals.inviteDescription':
      'Скопіюй і поділись ним напряму в Telegram або Viber.',
    'referrals.copyLink': 'Скопіювати',
    'referrals.copied': 'Скопійовано!',
    'referrals.shareText': 'Приєднуйся до мене у F1nFlow!',
    'badge.locked': 'Заблоковано',
    'main.badge.streakBronze': 'Відкрий застосунок 5 днів поспіль',
    'main.badge.streakSilver': 'Відкрий застосунок 14 днів поспіль',
    'main.badge.streakGold': 'Відкрий застосунок 30 днів поспіль',
    'main.badge.challengeWinner': 'Виконай тижневий челендж',
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
    'tips.step3':
      'Quick transaction limit and currency are saved automatically.',
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
    'main.challengeSpendLess':
      'Spend 2x less than your daily limit before deadline',
    'main.challengeNoSpendingDay': 'Complete at least 1 no-spend day',
    'main.streakCurrent': 'Current streak',
    'main.streakBest': 'Best streak',
    'main.days': 'days',
    'main.badges': 'Badges',
    'main.weeklyMissions': 'Weekly missions',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.invalid': 'Invalid',
    'main.income': 'Income',
    'main.expense': 'Expense',
    'category.create': 'Create category',
    'category.createPlaceholder': 'Category name',
    'category.editName': 'Edit category name',
    'category.newName': 'New category name',
    'category.icon': 'Category icon',
    'about.title': 'About F1nFlow',
    'about.description':
      'F1nFlow helps you manage spending, track categories, and keep your budget under control.',
    'about.telegramChannel': 'Telegram channel',
    'about.telegramChat': 'Telegram chat',
    'about.instagram': 'Instagram',
    'about.tiktok': 'TikTok',
    'about.tip': 'Tip',
    'referrals.title': 'Referrals',
    'referrals.peopleTitle': 'People you invited',
    'referrals.peopleDescription':
      'This is the list of users who joined with your referral code.',
    'referrals.joined': 'Joined',
    'referrals.emptyInvited': 'You do not have invited referrals yet.',
    'referrals.topTitle': 'Top 100 users by referrals',
    'referrals.topDescription':
      'Leaderboard based only on real referral records from the database.',
    'referrals.emptyTop': 'No referral leaderboard data yet.',
    'referrals.inviteTitle': 'Your personal invite link',
    'referrals.inviteDescription':
      'Copy and share it directly with Telegram or Viber.',
    'referrals.copyLink': 'Copy link',
    'referrals.copied': 'Copied!',
    'referrals.shareText': 'Join me on F1nFlow!',
    'badge.locked': 'Locked',
    'main.badge.streakBronze': 'Open app 5 days in a row',
    'main.badge.streakSilver': 'Open app 14 days in a row',
    'main.badge.streakGold': 'Open app 30 days in a row',
    'main.badge.challengeWinner': 'Complete weekly challenge',
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
    'tips.step2':
      'В режиме редактирования можно перетаскивать сферы и сохранять свой макет.',
    'tips.step3':
      'Лимит быстрых транзакций и валюта сохраняются автоматически.',
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
    'main.challengeSpendLess':
      'Потратить вдвое меньше дневного лимита до дедлайна',
    'main.challengeNoSpendingDay': 'Сделать минимум 1 день без трат',
    'main.streakCurrent': 'Текущий стрик',
    'main.streakBest': 'Лучший стрик',
    'main.days': 'дней',
    'main.badges': 'Бейджи',
    'main.weeklyMissions': 'Недельные миссии',
    'common.cancel': 'Отмена',
    'common.save': 'Сохранить',
    'common.close': 'Закрыть',
    'common.loading': 'Загрузка...',
    'common.invalid': 'Некорректно',
    'main.income': 'Доход',
    'main.expense': 'Расход',
    'category.create': 'Создать категорию',
    'category.createPlaceholder': 'Название категории',
    'category.editName': 'Редактировать название категории',
    'category.newName': 'Новое название категории',
    'category.icon': 'Иконка категории',
    'about.title': 'О F1nFlow',
    'about.description':
      'F1nFlow помогает управлять расходами, отслеживать категории и держать бюджет под контролем.',
    'about.telegramChannel': 'Telegram-канал',
    'about.telegramChat': 'Telegram-чат',
    'about.instagram': 'Instagram',
    'about.tiktok': 'TikTok',
    'about.tip': 'Совет',
    'referrals.title': 'Рефералы',
    'referrals.peopleTitle': 'Люди, которых вы пригласили',
    'referrals.peopleDescription':
      'Это список пользователей, которые присоединились по вашему реферальному коду.',
    'referrals.joined': 'Присоединился(лась)',
    'referrals.emptyInvited': 'У вас пока нет приглашённых рефералов.',
    'referrals.topTitle': 'Топ 100 пользователей по рефералам',
    'referrals.topDescription':
      'Рейтинг построен только на реальных реферальных записях из базы данных.',
    'referrals.emptyTop': 'Пока нет данных рейтинга рефералов.',
    'referrals.inviteTitle': 'Ваша персональная ссылка-приглашение',
    'referrals.inviteDescription':
      'Скопируйте и поделитесь ею напрямую в Telegram или Viber.',
    'referrals.copyLink': 'Скопировать',
    'referrals.copied': 'Скопировано!',
    'referrals.shareText': 'Присоединяйся ко мне в F1nFlow!',
    'badge.locked': 'Заблокировано',
    'main.badge.streakBronze': 'Открывай приложение 5 дней подряд',
    'main.badge.streakSilver': 'Открывай приложение 14 дней подряд',
    'main.badge.streakGold': 'Открывай приложение 30 дней подряд',
    'main.badge.challengeWinner': 'Выполни недельный челлендж',
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
    'main.challengeSpendLess':
      'Gastar 2x menos que tu límite diario antes del plazo',
    'main.challengeNoSpendingDay': 'Completar al menos 1 día sin gastos',
    'main.streakCurrent': 'Racha actual',
    'main.streakBest': 'Mejor racha',
    'main.days': 'días',
    'main.badges': 'Insignias',
    'main.weeklyMissions': 'Misiones semanales',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.close': 'Cerrar',
    'common.loading': 'Cargando...',
    'common.invalid': 'No válido',
    'main.income': 'Ingresos',
    'main.expense': 'Gastos',
    'category.create': 'Crear categoría',
    'category.createPlaceholder': 'Nombre de categoría',
    'category.editName': 'Editar nombre de categoría',
    'category.newName': 'Nuevo nombre de categoría',
    'category.icon': 'Icono de categoría',
    'about.title': 'Acerca de F1nFlow',
    'about.description':
      'F1nFlow te ayuda a gestionar gastos, seguir categorías y mantener tu presupuesto bajo control.',
    'about.telegramChannel': 'Canal de Telegram',
    'about.telegramChat': 'Chat de Telegram',
    'about.instagram': 'Instagram',
    'about.tiktok': 'TikTok',
    'about.tip': 'Consejo',
    'referrals.title': 'Referidos',
    'referrals.peopleTitle': 'Personas que invitaste',
    'referrals.peopleDescription':
      'Esta es la lista de usuarios que se unieron con tu código de referido.',
    'referrals.joined': 'Se unió',
    'referrals.emptyInvited': 'Aún no tienes referidos invitados.',
    'referrals.topTitle': 'Top 100 usuarios por referidos',
    'referrals.topDescription':
      'Clasificación basada solo en registros reales de referidos de la base de datos.',
    'referrals.emptyTop': 'Aún no hay datos de clasificación de referidos.',
    'referrals.inviteTitle': 'Tu enlace personal de invitación',
    'referrals.inviteDescription':
      'Cópialo y compártelo directamente con Telegram o Viber.',
    'referrals.copyLink': 'Copiar enlace',
    'referrals.copied': '¡Copiado!',
    'referrals.shareText': '¡Únete a mí en F1nFlow!',
    'badge.locked': 'Bloqueado',
    'main.badge.streakBronze': 'Abre la app 5 días seguidos',
    'main.badge.streakSilver': 'Abre la app 14 días seguidos',
    'main.badge.streakGold': 'Abre la app 30 días seguidos',
    'main.badge.challengeWinner': 'Completa el desafío semanal',
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
    'tips.step2':
      'У рэжыме рэдагавання можна перацягваць сферы і захоўваць уласны макет.',
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
    'main.challengeSpendLess':
      'Патраціць у 2 разы менш за дзённы ліміт да дэдлайну',
    'main.challengeNoSpendingDay': 'Зрабіць мінімум 1 дзень без выдаткаў',
    'main.streakCurrent': 'Бягучы стрык',
    'main.streakBest': 'Найлепшы стрык',
    'main.days': 'дзён',
    'main.badges': 'Бэйджы',
    'main.weeklyMissions': 'Тыднёвыя місіі',
    'common.cancel': 'Скасаваць',
    'common.save': 'Захаваць',
    'common.close': 'Закрыць',
    'common.loading': 'Загрузка...',
    'common.invalid': 'Некарэктна',
    'main.income': 'Даход',
    'main.expense': 'Выдаткі',
    'category.create': 'Стварыць катэгорыю',
    'category.createPlaceholder': 'Назва катэгорыі',
    'category.editName': 'Рэдагаваць назву катэгорыі',
    'category.newName': 'Новая назва катэгорыі',
    'category.icon': 'Іконка катэгорыі',
    'about.title': 'Пра F1nFlow',
    'about.description':
      'F1nFlow дапамагае кіраваць выдаткамі, адсочваць катэгорыі і трымаць бюджэт пад кантролем.',
    'about.telegramChannel': 'Telegram-канал',
    'about.telegramChat': 'Telegram-чат',
    'about.instagram': 'Instagram',
    'about.tiktok': 'TikTok',
    'about.tip': 'Парада',
    'referrals.title': 'Рэфералы',
    'referrals.peopleTitle': 'Людзі, якіх вы запрасілі',
    'referrals.peopleDescription':
      'Гэта спіс карыстальнікаў, якія далучыліся па вашым рэферальным кодзе.',
    'referrals.joined': 'Далучыўся(лася)',
    'referrals.emptyInvited': 'У вас пакуль няма запрошаных рэфералаў.',
    'referrals.topTitle': 'Топ 100 карыстальнікаў па рэфералах',
    'referrals.topDescription':
      'Рэйтынг заснаваны толькі на рэальных рэферальных запісах з базы даных.',
    'referrals.emptyTop': 'Пакуль няма даных рэферальнага рэйтынгу.',
    'referrals.inviteTitle': 'Ваша персанальная спасылка-запрашэнне',
    'referrals.inviteDescription':
      'Скапіруйце і падзяліцеся ёй напрамую ў Telegram або Viber.',
    'referrals.copyLink': 'Скапіраваць',
    'referrals.copied': 'Скапіравана!',
    'referrals.shareText': 'Далучайся да мяне ў F1nFlow!',
    'badge.locked': 'Заблакавана',
    'main.badge.streakBronze': 'Адкрывай праграму 5 дзён запар',
    'main.badge.streakSilver': 'Адкрывай праграму 14 дзён запар',
    'main.badge.streakGold': 'Адкрывай праграму 30 дзён запар',
    'main.badge.challengeWinner': 'Выканай тыднёвы чэлендж',
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
    'tips.step1':
      'Touchez une sphère pour ouvrir le panneau détaillé de catégorie.',
    'tips.step2':
      'En mode édition, vous pouvez déplacer les sphères et enregistrer votre disposition.',
    'tips.step3':
      'La limite rapide et la devise sont enregistrées automatiquement.',
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
    'main.challengeSpendLess':
      'Dépenser 2x moins que votre limite quotidienne avant l’échéance',
    'main.challengeNoSpendingDay': 'Faire au moins 1 journée sans dépenses',
    'main.streakCurrent': 'Série actuelle',
    'main.streakBest': 'Meilleure série',
    'main.days': 'jours',
    'main.badges': 'Badges',
    'main.weeklyMissions': 'Missions hebdomadaires',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.close': 'Fermer',
    'common.loading': 'Chargement...',
    'common.invalid': 'Invalide',
    'main.income': 'Revenus',
    'main.expense': 'Dépenses',
    'category.create': 'Créer une catégorie',
    'category.createPlaceholder': 'Nom de la catégorie',
    'category.editName': 'Modifier le nom de catégorie',
    'category.newName': 'Nouveau nom de catégorie',
    'category.icon': 'Icône de catégorie',
    'about.title': 'À propos de F1nFlow',
    'about.description':
      'F1nFlow vous aide à gérer vos dépenses, suivre les catégories et garder votre budget sous contrôle.',
    'about.telegramChannel': 'Canal Telegram',
    'about.telegramChat': 'Chat Telegram',
    'about.instagram': 'Instagram',
    'about.tiktok': 'TikTok',
    'about.tip': 'Conseil',
    'referrals.title': 'Parrainages',
    'referrals.peopleTitle': 'Personnes invitées',
    'referrals.peopleDescription':
      'Voici la liste des utilisateurs qui ont rejoint avec votre code de parrainage.',
    'referrals.joined': 'Rejoint le',
    'referrals.emptyInvited': 'Vous n’avez pas encore de filleuls invités.',
    'referrals.topTitle': 'Top 100 des utilisateurs par parrainages',
    'referrals.topDescription':
      'Classement basé uniquement sur les vrais enregistrements de parrainage de la base de données.',
    'referrals.emptyTop':
      'Aucune donnée de classement de parrainage pour le moment.',
    'referrals.inviteTitle': 'Votre lien d’invitation personnel',
    'referrals.inviteDescription':
      'Copiez-le et partagez-le directement avec Telegram ou Viber.',
    'referrals.copyLink': 'Copier le lien',
    'referrals.copied': 'Copié !',
    'referrals.shareText': 'Rejoins-moi sur F1nFlow !',
    'badge.locked': 'Verrouillé',
    'main.badge.streakBronze': 'Ouvrez l'app 5 jours d'affilée',
    'main.badge.streakSilver': 'Ouvrez l'app 14 jours d'affilée',
    'main.badge.streakGold': 'Ouvrez l'app 30 jours d'affilée',
    'main.badge.challengeWinner': 'Terminez le défi hebdomadaire',
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
    'tips.step1':
      'Tik op een sfeer om het detailpaneel van de categorie te openen.',
    'tips.step2':
      'In bewerkmodus kun je sferen verslepen en je eigen lay-out opslaan.',
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
    'main.challengeSpendLess':
      'Geef 2x minder uit dan je daglimiet vóór de deadline',
    'main.challengeNoSpendingDay': 'Voltooi minstens 1 dag zonder uitgaven',
    'main.streakCurrent': 'Huidige reeks',
    'main.streakBest': 'Beste reeks',
    'main.days': 'dagen',
    'main.badges': 'Badges',
    'main.weeklyMissions': 'Wekelijkse missies',
    'common.cancel': 'Annuleren',
    'common.save': 'Opslaan',
    'common.close': 'Sluiten',
    'common.loading': 'Laden...',
    'common.invalid': 'Ongeldig',
    'main.income': 'Inkomsten',
    'main.expense': 'Uitgaven',
    'category.create': 'Categorie maken',
    'category.createPlaceholder': 'Categorienaam',
    'category.editName': 'Categorienaam bewerken',
    'category.newName': 'Nieuwe categorienaam',
    'category.icon': 'Categoriepictogram',
    'about.title': 'Over F1nFlow',
    'about.description':
      'F1nFlow helpt je uitgaven te beheren, categorieën te volgen en je budget onder controle te houden.',
    'about.telegramChannel': 'Telegram-kanaal',
    'about.telegramChat': 'Telegram-chat',
    'about.instagram': 'Instagram',
    'about.tiktok': 'TikTok',
    'about.tip': 'Tip',
    'referrals.title': 'Verwijzingen',
    'referrals.peopleTitle': 'Mensen die je hebt uitgenodigd',
    'referrals.peopleDescription':
      'Dit is de lijst met gebruikers die met jouw verwijzingscode zijn toegetreden.',
    'referrals.joined': 'Toegetreden',
    'referrals.emptyInvited': 'Je hebt nog geen uitgenodigde verwijzingen.',
    'referrals.topTitle': 'Top 100 gebruikers op verwijzingen',
    'referrals.topDescription':
      'Ranglijst alleen gebaseerd op echte verwijzingsrecords uit de database.',
    'referrals.emptyTop': 'Nog geen verwijzingsranglijstgegevens.',
    'referrals.inviteTitle': 'Je persoonlijke uitnodigingslink',
    'referrals.inviteDescription':
      'Kopieer en deel hem rechtstreeks via Telegram of Viber.',
    'referrals.copyLink': 'Link kopiëren',
    'referrals.copied': 'Gekopieerd!',
    'referrals.shareText': 'Doe mee met mij op F1nFlow!',
    'badge.locked': 'Vergrendeld',
    'main.badge.streakBronze': 'Open de app 5 dagen op rij',
    'main.badge.streakSilver': 'Open de app 14 dagen op rij',
    'main.badge.streakGold': 'Open de app 30 dagen op rij',
    'main.badge.challengeWinner': 'Voltooi de wekelijkse challenge',
  },
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
    { code: 'nl', flag: '🇳🇱', nativeName: 'Nederlands' },
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
    return (
      this.options.find((item) => item.code === language)?.nativeName ??
      language
    );
  }
}
