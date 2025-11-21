import { TestBed } from '@angular/core/testing';

import { Iframe } from './iframe';

describe('Iframe', () => {
  let service: Iframe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Iframe);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
