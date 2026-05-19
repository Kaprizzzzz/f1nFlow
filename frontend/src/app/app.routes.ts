import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/component/main.component';
import { ReferralsComponent } from './pages/referrals/referrals.component';
import { EventsComponent } from './pages/events/events.component';
import { AboutComponent } from './pages/about/about.component';
import { GoalsComponent } from './pages/goals/goals.component';
import { WalletComponent } from './pages/wallet/wallet.component';

export const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'referrals', component: ReferralsComponent },
  { path: 'events', component: EventsComponent },
  { path: 'goals', component: GoalsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'wallet', component: WalletComponent },
  { path: '**', redirectTo: '' } // Перенаправлення, якщо шлях не знайдено
];