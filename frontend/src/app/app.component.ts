import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingComponent } from './pages/loading/loading.component';
import { CurrencyPickerComponent } from './pages/currency-picker/currency-picker.component';
import { SessionService } from './pages/user/service/user.service';

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: {
      ready?: () => void;
      expand?: () => void;
      disableVerticalSwipes?: () => void;
      isExpanded?: boolean;
    };
  };
};

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
  isMainRoute = true;
  isKeyboardOpen = false;

  private subscription = new Subscription();
  private viewportBaseHeight = 0;
  private readonly viewportResizeHandler = () => this.updateKeyboardState();

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.showSplash = false;
    }, 2500);

    this.setupTelegramWebApp();

    this.subscription.add(
      this.sessionService.user$.subscribe((user) => {
        this.userName = user?.userName || 'Guest';
      })
    );

    this.isMainRoute = this.isRootRoute(this.router.url);
    this.subscription.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.isMainRoute = this.isRootRoute(event.urlAfterRedirects);
        }
      })
    );
    this.setupViewportKeyboardDetection();
  }

   private setupTelegramWebApp(): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    const webApp = (window as TelegramWindow).Telegram?.WebApp;
    if (!webApp) {
      return;
    }

    webApp.ready?.();
    webApp.expand?.();
    webApp.disableVerticalSwipes?.();
  }

  private isRootRoute(url: string): boolean {
    const parsed = this.router.parseUrl(url);
    const primarySegments = parsed.root.children['primary']?.segments ?? [];
    return primarySegments.length === 0;
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.viewportResizeHandler);
    }
    this.subscription.unsubscribe();
    this.sessionService.sendPresence(false);
  }
  onFieldFocusIn(): void {
    this.updateKeyboardState();
  }

  onFieldFocusOut(): void {
    setTimeout(() => this.updateKeyboardState(), 40);
  }

  private setupViewportKeyboardDetection(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.viewportBaseHeight = window.visualViewport?.height || window.innerHeight;
    window.visualViewport?.addEventListener('resize', this.viewportResizeHandler);
  }

  private updateKeyboardState(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    this.viewportBaseHeight = Math.max(this.viewportBaseHeight, viewportHeight);
    const heightLoss = this.viewportBaseHeight - viewportHeight;
    const hasFocusedInput =
      typeof document !== 'undefined' &&
      !!document.activeElement?.closest('input, textarea, [contenteditable="true"], [contenteditable=""]');

    this.isKeyboardOpen = hasFocusedInput && heightLoss > 120;
  }
}