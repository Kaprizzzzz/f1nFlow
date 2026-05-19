import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SubscriptionPlanDto {
  id: string;
  code: string;
  name: string;
  interval: 'month' | 'year';
  priceUsd: string | number;
  intervalCount: number;
}

export interface SubscriptionDto {
  id: string;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  expiresAt: string | null;
  plan?: SubscriptionPlanDto;
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getOverview(): Observable<{ plans: SubscriptionPlanDto[]; activeSubscription: SubscriptionDto | null }> {
    return this.http.get<{ plans: SubscriptionPlanDto[]; activeSubscription: SubscriptionDto | null }>(`${this.apiUrl}/users/me/billing`);
  }

  activate(planCode: string): Observable<SubscriptionDto> {
    return this.http.post<{ subscription: SubscriptionDto }>(`${this.apiUrl}/users/me/billing/activate`, { planCode }).pipe(
      map((response) => response.subscription),
    );
  }

  startTrial(): Observable<SubscriptionDto> {
    return this.http.post<{ subscription: SubscriptionDto }>(`${this.apiUrl}/users/me/billing/trial`, {}).pipe(
      map((response) => response.subscription),
    );
  }

  cancel(): Observable<SubscriptionDto> {
    return this.http.post<{ subscription: SubscriptionDto }>(`${this.apiUrl}/users/me/billing/cancel`, {}).pipe(
      map((response) => response.subscription),
    );
  }
}
