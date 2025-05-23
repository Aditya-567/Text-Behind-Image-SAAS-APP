import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements AfterViewInit {
  email: string = '';
  password: string = '';
  displayName: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  // Sign In with Email & Password
  signInWithEmail(event: Event) {
    event.preventDefault();
    this.authService
      .signIn(this.email, this.password)
      .then((res) => {
        console.log('Logged in Successfully!', res);
        this.router.navigate(['/dashboard']);
      })
      .catch((err) => console.error('Login Error:', err));
  }

  // Sign Up with Email & Password
  signUpWithEmail(event: Event) {
    event.preventDefault();
    this.authService
      .signUp(this.email, this.password)
      .then((res) => {
        res.user?.updateProfile({
          displayName: this.displayName,
        });
        console.log('Account Created Successfully!', res);
        this.router.navigate(['/dashboard']);
      })
      .catch((err) => console.error('Signup Error:', err));
  }

  // Google Sign In
  googleSignIn(event: Event) {
    event.preventDefault();
    this.authService
      .googleSignIn()
      .then((res) => {
        console.log('Google Sign-In Success:', res);
        this.router.navigate(['/dashboard']);
      })
      .catch((err) => console.error('Google Sign-In Error:', err));
  }

  // Facebook Sign In
  facebookSignIn(event: Event) {
    event.preventDefault();
    this.authService
      .facebookSignIn()
      .then((res) => {
        console.log('Facebook Sign-In Success:', res);
        this.router.navigate(['/dashboard']);
      })
      .catch((err) => console.error('Facebook Sign-In Error:', err));
  }

  // Forgot Password
  resetPassword(event: Event) {
    event.preventDefault();
    if (!this.email) {
      alert('Please enter your email address to reset your password.');
      return;
    }
    this.authService
      .resetPassword(this.email)
      .then(() => alert('Password reset email sent!'))
      .catch((err: any) => console.error('Reset Error:', err));
  }

  ngAfterViewInit(): void {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');

    if (signUpButton && signInButton && container) {
      signUpButton.addEventListener('click', () => {
        container.classList.add('right-panel-active');
      });

      signInButton.addEventListener('click', () => {
        container.classList.remove('right-panel-active');
      });
    }
  }
}
