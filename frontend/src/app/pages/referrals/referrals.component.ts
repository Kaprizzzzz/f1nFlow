import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


interface ReferralPerson {
  id: string;
  name: string;
  joinedAt: Date;
  referralsCount: number;
}

@Component({
  selector: 'app-referrals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './referrals.component.html',
  styleUrl: './referrals.component.scss'
})


export class ReferralsComponent {
  readonly invitedPeople: ReferralPerson[] = [
    { id: 'inv-1', name: 'Олексій', joinedAt: new Date('2026-01-18T11:20:00'), referralsCount: 4 },
    { id: 'inv-2', name: 'Марина', joinedAt: new Date('2026-01-26T09:05:00'), referralsCount: 2 },
    { id: 'inv-3', name: 'Ігор', joinedAt: new Date('2026-02-04T15:45:00'), referralsCount: 1 },
    { id: 'inv-4', name: 'Катерина', joinedAt: new Date('2026-02-20T18:30:00'), referralsCount: 6 }
  ];

  readonly topReferrers: ReferralPerson[] = this.buildTopReferrers();

  trackById(_: number, item: ReferralPerson): string {
    return item.id;
  }
  private buildTopReferrers(): ReferralPerson[] {
    return Array.from({ length: 100 }, (_, index) => ({
      id: `top-${index + 1}`,
      name: `User #${index + 1}`,
      joinedAt: new Date('2026-01-01T00:00:00'),
      referralsCount: 220 - index
    }));
  }
}
