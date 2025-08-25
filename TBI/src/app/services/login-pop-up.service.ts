import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Defines the state for the login popup.
 * isOpen: Controls the visibility of the popup.
 * isSignUp: Determines whether to show the 'Sign Up' or 'Sign In' form.
 */
export interface LoginPopupState {
  isOpen: boolean;
  isSignUp: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LoginPopupService {
  private loginPopupSource = new BehaviorSubject<LoginPopupState>({
    isOpen: false,
    isSignUp: false,
  });

  loginPopupState$ = this.loginPopupSource.asObservable();
  constructor() {}
  /**
   * Opens the login popup.
   * @param isSignUp - If true, the popup will open with the 'Sign Up' form active.
   * Otherwise, it will show the 'Sign In' form. Defaults to false.
   */
  open(isSignUp: boolean = false) {
    this.loginPopupSource.next({ isOpen: true, isSignUp });
  }

  close() {
    this.loginPopupSource.next({ isOpen: false, isSignUp: false });
  }
}
