import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingComponent } from './pages/loading/loading.component';
import { CurrencyPickerComponent } from './pages/currency-picker/currency-picker.component';
import { SessionService } from './pages/user/service/user.service';
import { I18nService } from './core/i18n.service';
import { AppLanguage } from './pages/history/models/finance.models';
import { BalanceService } from './pages/history/balance.service';

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
  showLanguageModal = false;
  showOnboarding = false;
  onboardingStep = 0;

  readonly onboardingSteps = ['tips.step1', 'tips.step2', 'tips.step3'] as const;
  readonly languageOptions = this.i18nService.options;

  private readonly onboardingStorageKey = 'f1nflow-onboarding-shown';
  private subscription = new Subscription();
  private viewportBaseHeight = 0;
  private readonly viewportResizeHandler = () => this.updateKeyboardState();

  constructor(
    private sessionService: SessionService,
    private router: Router,
    readonly i18nService: I18nService,
    private readonly balanceService: BalanceService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.showSplash = false;
      this.tryShowOnboarding();
    }, 2500);

    this.setupTelegramWebApp();

    this.subscription.add(
      this.sessionService.user$.subscribe((user) => {
        this.userName = user?.userName || 'Guest';
      })
    );

    this.subscription.add(
      this.balanceService.language$.subscribe((language) => {
        this.i18nService.setLanguage(language);
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

  t(key: Parameters<I18nService['t']>[0]): string {
    return this.i18nService.t(key);
  }

  get currentLanguageLabel(): string {
    return this.i18nService.getLanguageLabel(this.i18nService.language);
  }

  openLanguageModal(): void {
    this.showLanguageModal = true;
  }

  closeLanguageModal(): void {
    this.showLanguageModal = false;
  }

  selectLanguage(language: AppLanguage): void {
    this.balanceService.setLanguage(language);
    this.closeLanguageModal();
  }

  nextOnboardingStep(): void {
    if (this.onboardingStep < this.onboardingSteps.length - 1) {
      this.onboardingStep += 1;
      return;
    }

    this.finishOnboarding();
  }

  previousOnboardingStep(): void {
    if (this.onboardingStep <= 0) {
      return;
    }

    this.onboardingStep -= 1;
  }

  skipOnboarding(): void {
    this.finishOnboarding();
  }

  private tryShowOnboarding(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const alreadyShown = localStorage.getItem(this.onboardingStorageKey) === '1';
    if (!alreadyShown) {
      this.showOnboarding = true;
      this.onboardingStep = 0;
    }
  }

  private finishOnboarding(): void {
    this.showOnboarding = false;
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.onboardingStorageKey, '1');
    }
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
