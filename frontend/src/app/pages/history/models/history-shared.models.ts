export interface CategoryItem {
  name: string;
  amount: number;
  icon?: string;
  position?: { left: number; top: number };
}

export interface NewsItem {
  id: string;
  title: string;
  isRead: boolean;
}

export type Currency =
  | 'EUR'
  | 'USD'
  | 'UAH'
  | 'RUB'
  | 'PLN'
  | 'TRY'
  | 'CAD'
  | 'GBP'
  | 'HRK';
