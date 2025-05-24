import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';

describe('authGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(AuthGuard).toBeTruthy();
  });
});
