import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CcmWorkQueue } from './ccm-work-queue';

describe('CcmWorkQueue', () => {
  let component: CcmWorkQueue;
  let fixture: ComponentFixture<CcmWorkQueue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CcmWorkQueue]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CcmWorkQueue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
