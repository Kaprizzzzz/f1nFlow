export class CategoryDto {
  name: string;
  amount: number;
  icon?: string;
}

export class SpherePositionDto {
  left: number;
  top: number;
}

export class SphereLayoutDto {
  income: SpherePositionDto;
  expense: SpherePositionDto;
  saving: SpherePositionDto;
  news: SpherePositionDto;
    recent: SpherePositionDto;
}

export class GoalsPreferencesDto {
  theme: 'default' | 'girly';
  visualizationMode: 'amount' | 'segments';
  periodStart?: string;
  periodEnd?: string;
  deadline?: string;
}

export class TransactionDto {
  amount: number;
  category: string;
  type: 'plus' | 'minus';
  date: string;
  label?: string;
}

export class LoginDto {
  telegramId?: string;
  userName?: string;
  initData?: string;
  referredBy?: string;
}

export class PresenceDto {
  isOnline: boolean;
}

export class SaveStateDto {
  currency?: 'EUR' | 'USD' | 'UAH';
  incomeCategories?: CategoryDto[];
  expenseCategories?: CategoryDto[];
  sphereLayout?: SphereLayoutDto;
  transactions?: TransactionDto[];
  quickTransactionsLimit?: number;
  news?: Array<{ id: string; title: string; isRead: boolean }>;
  goalsPreferences?: GoalsPreferencesDto;
}