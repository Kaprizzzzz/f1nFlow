import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/component/main.component';
import { ReferralsComponent } from './pages/referrals/referrals.component';
import { EventsComponent } from './pages/events/events.component';
import { AboutComponent } from './pages/about/about.component';

export const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'referrals', component: ReferralsComponent },
  { path: 'events', component: EventsComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: '' } // Перенаправлення, якщо шлях не знайдено
];