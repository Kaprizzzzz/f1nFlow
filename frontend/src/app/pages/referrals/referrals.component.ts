import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SessionService } from '../user/service/user.service';


interface ReferralPerson {
  id: string;
  name: string;
  joinedAt: Date;
  referralsCount: number;
}

interface ReferralOverviewPayload {
  referralCode: string;
  invitedPeople: ReferralPerson[];
  topReferrers: ReferralPerson[];
}

@Component({
  selector: 'app-referrals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './referrals.component.html',
  styleUrl: './referrals.component.scss'
})

export class ReferralsComponent implements OnInit, OnDestroy {
  invitedPeople: ReferralPerson[] = [];
  topReferrers: ReferralPerson[] = [];
  inviteLink = '';
  copyStatus = '';

  private subscription = new Subscription();

  constructor(
    private readonly sessionService: SessionService,
    private readonly http: HttpClient
  ) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

  this.subscription.add(
      this.sessionService.user$.subscribe((user) => {
        const baseUrl = `${window.location.origin}${window.location.pathname}`;

        if (!user) {
          this.inviteLink = `${baseUrl}?ref=guest`;
          return;
        }

  this.inviteLink = this.buildFallbackInviteLink(baseUrl, user.telegramId);

        this.http
          .get<ReferralOverviewPayload>(`${this.getApiUrl()}/users/${user.telegramId}/referrals`)
          .subscribe({
            next: (data) => {
              this.invitedPeople = data.invitedPeople.map((item) => ({
                ...item,
                joinedAt: new Date(item.joinedAt)
              }));
              this.topReferrers = data.topReferrers.map((item) => ({
                ...item,
                joinedAt: new Date(item.joinedAt)
              }));
              this.inviteLink = `${baseUrl}?ref=${encodeURIComponent(data.referralCode)}`;
            },
            error: () => {
              this.invitedPeople = [];
              this.topReferrers = [];
            }
          });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  trackById(_: number, item: ReferralPerson): string {
    return item.id;
  }
  async copyInviteLink(): Promise<void> {
    if (!this.inviteLink || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(this.inviteLink);
    this.copyStatus = 'Copied!';
    setTimeout(() => (this.copyStatus = ''), 2200);
  }

  getTelegramShareLink(): string {
    return `https://t.me/share/url?url=${encodeURIComponent(this.inviteLink)}&text=${encodeURIComponent('Join me on F1nFlow!')}`;
  }

  getViberShareLink(): string {
    return `viber://forward?text=${encodeURIComponent(`Join me on F1nFlow: ${this.inviteLink}`)}`;
  }

  private buildFallbackInviteLink(baseUrl: string, telegramId: string): string {
    const fallbackCode = telegramId.replace(/[^a-zA-Z0-9]/g, '').slice(-8) || 'guest';
    return `${baseUrl}?ref=${encodeURIComponent(fallbackCode)}`;
  }

  private getApiUrl(): string {
    if (typeof localStorage === 'undefined') {
      return 'http://localhost:3000';
    }
    const fromStorage = localStorage.getItem('f1nflow-api-url')?.trim();
    return (fromStorage || 'http://localhost:3000').replace(/\/$/, '');
  }
}
