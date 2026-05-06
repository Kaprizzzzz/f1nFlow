export interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: 'plus' | 'minus';
  date: Date;
  label?: string;
}

export interface WeeklyChallenge {
  category: string;
  limit: number;
  spent: number;
  weekStart: string;
  completed: boolean;
  currency?: string;
}

export type SphereTab = 'income' | 'expense' | 'saving' | 'news' | 'recent';
export type SphereLayout = Record<SphereTab, { left: number; top: number }>;

export type GoalsPreferences = {
  theme: 'default' | 'girly';
  visualizationMode: 'amount' | 'segments';
  periodStart?: string;
  periodEnd?: string;
  deadline?: string;
  fxBase?: string;
  fxTarget?: string;
};

export type AppLanguage = 'uk' | 'en' | 'ru' | 'es' | 'be' | 'fr' | 'nl';
