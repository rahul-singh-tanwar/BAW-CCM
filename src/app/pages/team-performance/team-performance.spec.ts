import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamPerformance } from './team-performance';

describe('TeamPerformance', () => {
  let component: TeamPerformance;
  let fixture: ComponentFixture<TeamPerformance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamPerformance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamPerformance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
