import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GopDocument } from './gop-document';

describe('GopDocument', () => {
  let component: GopDocument;
  let fixture: ComponentFixture<GopDocument>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GopDocument]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GopDocument);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have document data', () => {
    expect(component.documentData).toBeDefined();
    expect(component.documentData.gopNumber).toBe('GOP-2024-001234');
  });

  it('should call downloadPdf', () => {
    spyOn(window, 'alert');
    component.downloadPdf();
    expect(window.alert).toHaveBeenCalled();
  });
});
