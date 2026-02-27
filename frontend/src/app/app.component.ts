import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingComponent } from './pages/loading/loading.component';
import { CurrencyPickerComponent } from './pages/currency-picker/currency-picker.component';
import { SessionService } from './pages/user/service/user.service';

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
export class AppComponent implements OnInit, OnDestroy {
  showSplash = true;
  userName = '...';

  private subscription = new Subscription();

  constructor(private sessionService: SessionService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.showSplash = false;
    }, 2500);

    this.subscription.add(
      this.sessionService.user$.subscribe((user) => {
        this.userName = user?.userName || 'Guest';
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.sessionService.sendPresence(false);
  }
}