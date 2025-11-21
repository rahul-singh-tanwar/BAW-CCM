import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyDetailsDialog } from './policy-details-dialog';

describe('PolicyDetailsDialog', () => {
  let component: PolicyDetailsDialog;
  let fixture: ComponentFixture<PolicyDetailsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyDetailsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyDetailsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
