import { TestBed } from '@angular/core/testing';

import { SignallingService } from './signalling.service';

describe('SignallingService', () => {
  let service: SignallingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignallingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
