import { Toast, ToasterService } from './../../services/toaster.service';
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service.service';
import { User } from '../user.model';
import {
  LoginPopupService,
  LoginPopupState,
} from '../../services/login-pop-up.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  // --- Form & State Properties ---
  email: string = '';
  password: string = '';
  displayName: string = '';
  resetEmail: string = '';

  showPopup = signal(false);
  isSignUp = false;
  isForgotPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loginPopupService: LoginPopupService,
    private Toast : ToasterService,
  ) {}

  ngOnInit() {
    // Subscribe to the popup service to control the modal's state
    this.loginPopupService.loginPopupState$.subscribe(
      (state: LoginPopupState) => {
        this.showPopup.set(state.isOpen);
        // When the popup opens, set the view to either Sign In or Sign Up
        if (state.isOpen) {
          this.isSignUp = state.isSignUp;
        }
      }
    );

    // If a user logs in, close the popup automatically
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.closePopup();
      }
    });
  }

  /**
   * Toggles the view between the Sign In and Sign Up forms.
   */
  toggleForm() {
    this.isSignUp = !this.isSignUp;
  }

  /**
   * Closes the popup and resets all form fields and states.
   */
  closePopup() {
    this.loginPopupService.close();
    // Reset state after a short delay to allow for closing animation
    setTimeout(() => {
      this.isSignUp = false;
      this.isForgotPassword = false;
      this.email = '';
      this.password = '';
      this.displayName = '';
      this.resetEmail = '';
    }, 300);
  }

  // --- Authentication Methods ---

  signInWithEmail(event: Event) {
    event.preventDefault();
    this.authService
      .signIn(this.email, this.password)
      .then((res) => {
        this.router.navigate(['/home']);
      })
      .catch((err) => {

        let errorMessage = 'An unexpected error occurred. Please try again.';

        // Check for specific Firebase authentication error codes
        if (err.code) {
          switch (err.code) {
            case 'auth/invalid-credential':
              errorMessage = 'Invalid Credentials';
              break;
            case 'auth/user-not-found':
              errorMessage = 'No account found with this email';
              break;
            case 'auth/wrong-password':
              // This is often covered by 'auth/invalid-credential', but can occur
              errorMessage = 'Invalid Credentials';
              break;
            case 'auth/invalid-email':
              errorMessage = 'Invalid Credentials';
              break;
            case 'auth/too-many-requests':
              errorMessage =
                'Too many failed login attempts. Try again later';
              break;
          }
        }

        // Use your Toast service to show the user-friendly error message
        this.Toast.show(errorMessage, 'error');
      });
  }

  signUpWithEmail(event: Event) {
    event.preventDefault();
    this.authService
      .signUp(this.email, this.password)
      .then((res) => {
        const user = res.user;
        if (user) {
          user
            .updateProfile({ displayName: this.displayName })
            .then(() => user.reload())
            .then(() => {
              this.authService.getCurrentUser().subscribe((updatedUser) => {
                if (updatedUser) {
                  this.authService.setCurrentUser(updatedUser as User);
                }
                this.router.navigate(['/home']);
              });
            });
        }
      })
      .catch((err) => {
        if (err.code === "auth/email-already-in-use") {
          this.Toast.show('Email already in use.','error');
        }else{
          this.Toast.show('Error signing up. Please try again.','error');
        }
      });
  }

  googleSignIn(event: Event) {
    event.preventDefault();
    this.authService
      .googleSignIn()
      .then((res) => {
        this.authService.getCurrentUser().subscribe((user) => {
          if (user) {
            this.authService.setCurrentUser(user as unknown as User);
          }
        });
        this.router.navigate(['/home']);
      })
      .catch((err) => this.Toast.show('Error signing in with Google.','error'));
  }

  githubSignIn(event: Event) {
    event.preventDefault();
    this.authService
      .githubSignIn()
      .then((res) => {
        this.authService.getCurrentUser().subscribe((user) => {
          if (user) {
            this.authService.setCurrentUser(user as unknown as User);
          }
        });
        this.router.navigate(['/home']);
      })
      .catch((err) => this.Toast.show('Error signing in with GitHub.','error'));
  }

  resetPassword(event: Event) {
    event.preventDefault();
    if (!this.resetEmail) {
      // Use resetEmail for the forgot password form
      alert('Please enter your email address to reset your password.');
      return;
    }
    this.authService
      .resetPassword(this.resetEmail)
      .then(() => {
        alert('Password reset email sent!');
        this.isForgotPassword = false; // Return to sign-in view
      })
      .catch((err: any) => console.error('Reset Error:', err));
  }
}
