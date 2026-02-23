 import { Component, OnInit } from '@angular/core';
 import { CommonModule } from '@angular/common';
 import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
 import { LoadingComponent } from './pages/loading/loading.component';
 import { CurrencyPickerComponent } from './pages/currency-picker/currency-picker.component';
 
 @Component({
   selector: 'app-root',
   standalone: true,
   imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LoadingComponent,
    CurrencyPickerComponent
   ],
   templateUrl: './app.component.html',
   styleUrl: './app.component.scss'
 })
 export class AppComponent implements OnInit {
   showSplash = true;
 
   ngOnInit(): void {
     setTimeout(() => {
       this.showSplash = false;
     }, 2500);
   }
 }
