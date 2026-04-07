import { SphereLayout } from '../history/balance.service';
import { RecentCategoryGroup } from '../history/recent/recent.component';

export interface MainViewModel {
  canEditLayout: boolean;
  quickTransactionsLimit: number;
  recentCategoryGroups: RecentCategoryGroup[];
  weeklyChallengeText: string;
  sphereLayout: SphereLayout | null;
}
