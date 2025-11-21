import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreArrangementForm } from './pre-arrangement-form';

describe('PreArrangementForm', () => {
  let component: PreArrangementForm;
  let fixture: ComponentFixture<PreArrangementForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreArrangementForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreArrangementForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
