import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Saving } from './saving';

describe('Saving', () => {
  let component: Saving;
  let fixture: ComponentFixture<Saving>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Saving]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Saving);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
