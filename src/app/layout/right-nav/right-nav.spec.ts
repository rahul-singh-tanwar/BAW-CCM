import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightNav } from './right-nav';

describe('RightNav', () => {
  let component: RightNav;
  let fixture: ComponentFixture<RightNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RightNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
