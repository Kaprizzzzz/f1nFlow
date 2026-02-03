import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Expence } from './expence';

describe('Expence', () => {
  let component: Expence;
  let fixture: ComponentFixture<Expence>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Expence]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Expence);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
