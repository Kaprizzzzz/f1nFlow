export interface CategoryItem {
  name: string;
  amount: number;
  icon?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  isRead: boolean;
}

export type Currency = 'EUR' | 'USD' | 'UAH';
