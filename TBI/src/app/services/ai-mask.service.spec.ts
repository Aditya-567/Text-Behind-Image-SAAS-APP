import { TestBed } from '@angular/core/testing';

import { AiMaskService } from './ai-mask.service';

describe('AiMaskService', () => {
  let service: AiMaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiMaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
