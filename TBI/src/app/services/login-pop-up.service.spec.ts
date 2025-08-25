import { TestBed } from '@angular/core/testing';

import { LoginPopUpService } from './login-pop-up.service';

describe('LoginPopUpService', () => {
  let service: LoginPopUpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginPopUpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
