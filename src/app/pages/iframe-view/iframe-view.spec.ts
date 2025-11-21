import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IframeView } from './iframe-view';

describe('IframeView', () => {
  let component: IframeView;
  let fixture: ComponentFixture<IframeView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IframeView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IframeView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
