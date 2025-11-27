import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderDetailsDialog } from './provider-details-dialog';

describe('ProviderDetailsDialog', () => {
  let component: ProviderDetailsDialog;
  let fixture: ComponentFixture<ProviderDetailsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderDetailsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderDetailsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
