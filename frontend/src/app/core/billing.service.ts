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

export interface PaymentDto {
  id: string;
  provider: string | null;
  providerRef: string;
  paymentUrl: string;
  amountUsd: string;
  planCode: string;
  merchantWallet: string;
}

export interface BillingOverviewDto {
  plans: SubscriptionPlanDto[];
  activeSubscription: SubscriptionDto | null;
  hasGoalsAccess: boolean;
  pendingPayment?: unknown;
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getOverview(): Observable<BillingOverviewDto> {
    return this.http.get<BillingOverviewDto>(`${this.apiUrl}/users/me/billing`);
  }

  createPayment(
    planCode: string,
    source = 'goals_popup',
  ): Observable<PaymentDto> {
    return this.http
      .post<{ payment: PaymentDto }>(
        `${this.apiUrl}/users/me/billing/payment`,
        {
          planCode,
          source,
        },
      )
      .pipe(map((response) => response.payment));
  }

  activate(planCode: string): Observable<SubscriptionDto> {
    return this.http
      .post<{
        subscription: SubscriptionDto;
      }>(`${this.apiUrl}/users/me/billing/activate`, { planCode })
      .pipe(map((response) => response.subscription));
  }

  startTrial(): Observable<PaymentDto> {
    return this.http
      .post<{
        payment: PaymentDto;
      }>(`${this.apiUrl}/users/me/billing/trial`, {})
      .pipe(map((response) => response.payment));
  }

  cancel(): Observable<SubscriptionDto> {
    return this.http
      .post<{
        subscription: SubscriptionDto;
      }>(`${this.apiUrl}/users/me/billing/cancel`, {})
      .pipe(map((response) => response.subscription));
  }
}
