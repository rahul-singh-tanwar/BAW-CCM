import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessPerformance } from './process-performance';

describe('ProcessPerformance', () => {
  let component: ProcessPerformance;
  let fixture: ComponentFixture<ProcessPerformance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessPerformance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessPerformance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
