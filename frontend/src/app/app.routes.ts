import { Routes } from '@angular/router';      // Клас має називатися MainComponent
import { MainComponent } from './pages/main/component/main.component';
import { LoadingComponent } from './pages/loading/loading.component';// Клас має називатися LoadingComponent

export const routes: Routes = [
  { path: '', component: LoadingComponent }, 
  { path: 'main', component: MainComponent },
  { path: '**', redirectTo: '' } 
];