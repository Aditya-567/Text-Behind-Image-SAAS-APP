import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth-service.service';
import { User } from '../user.model';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, AfterViewInit {
  email: string = '';
  password: string = '';
  displayName: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.router.navigate(['/home']);
      }
    });

    // Get the mode from query params and show appropriate form
    this.route.queryParams.subscribe((params) => {
      const mode = params['mode'];
      setTimeout(() => {
        const container = document.getElementById('container');
        if (container) {
          if (mode === 'signup') {
            container.classList.add('right-panel-active');
          } else {
            container.classList.remove('right-panel-active');
          }
        }
      });
    });
  }

  // Sign In with Email & Password
  signInWithEmail(event: Event) {
    event.preventDefault();
    this.authService
      .signIn(this.email, this.password)
      .then((res) => {
        console.log('Login Success:', res);
        this.router.navigate(['/home']);
      })
      .catch((err) => console.error('Login Error:', err));
  }

  signUpWithEmail(event: Event) {
    event.preventDefault();
    this.authService
      .signUp(this.email, this.password)
      .then((res) => {
        const user = res.user;
        if (user) {
          user
            .updateProfile({
              displayName: this.displayName,
            })
            .then(() => user.reload())
            .then(() => {
              // Fetch updated user from Firebase
              this.authService.getCurrentUser().subscribe((updatedUser) => {
                if (updatedUser) {
                  this.authService.setCurrentUser(updatedUser as User);
                }
                this.router.navigate(['/home']);
              });
            });
        }
      })
      .catch((err) => console.error('Signup Error:', err));
  }

  // Google Sign In
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
        console.log('Google Sign-In Success:', res);
        this.router.navigate(['/home']);
      })
      .catch((err) => console.error('Google Sign-In Error:', err));
  }

  // Add this method in LoginComponent
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
        console.log('GitHub Sign-In Success:', res);
        this.router.navigate(['/home']);
      })
      .catch((err) => console.error('GitHub Sign-In Error:', err));
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
