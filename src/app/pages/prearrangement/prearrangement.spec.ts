import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Prearrangement } from './prearrangement';

describe('Prearrangement', () => {
  let component: Prearrangement;
  let fixture: ComponentFixture<Prearrangement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Prearrangement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Prearrangement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
