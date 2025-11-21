import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ReviewPolicies } from './review-policies';

describe('ReviewPolicies', () => {
  let component: ReviewPolicies;
  let fixture: ComponentFixture<ReviewPolicies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewPolicies, FormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewPolicies);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
