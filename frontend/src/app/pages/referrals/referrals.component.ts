import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BalanceService, Transaction } from '../history/balance.service';

@Component({
  selector: 'app-referrals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './referrals.component.html',
  styleUrl: './referrals.component.scss'
})


export class ReferralsComponent {
  readonly transactions$: Observable<Transaction[]>;

  constructor(private readonly balanceService: BalanceService) {
    this.transactions$ = this.balanceService.transactions$.pipe(
      map((items) => [...items].sort((first, second) => second.date.getTime() - first.date.getTime()))
    );
  }

  trackById(_: number, item: Transaction): string {
    return item.id;
  }
}
