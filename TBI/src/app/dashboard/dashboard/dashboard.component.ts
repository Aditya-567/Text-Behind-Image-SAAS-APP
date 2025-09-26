import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../login/auth-service.service';
import { LoginPopupService } from './../../services/login-pop-up.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  showLoginPopup = false;
  showScrollTop = false;

  constructor(private router: Router, private authService: AuthService, public loginPopupService: LoginPopupService) {
    // Initialize scroll event listener
    window.addEventListener('scroll', () => {
      this.showScrollTop = window.scrollY > 400; // Show button after 400px scroll
    });
  }

  ngOnInit() {
    // ngOnInit logic
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }


  closeLoginPopup() {
    this.showLoginPopup = false;
  }

  navigateToLogin() {
    this.showLoginPopup = false;
    this.loginPopupService.open(false);
  }

  navigateToRegister() {
    this.showLoginPopup = false;
    this.loginPopupService.open(true);
  }


  // Handle TBI navigation with login check
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }


  featureCards = [
    {
      icon: 'ifc.svg',
      title: 'Profile Enhancement',
      description: 'Improve and retouch profile pictures with AI precision.',
    },
    {
      icon: 'dfc.svg',
      title: 'Access Anytime',
      description: 'Save and edit your images from anywhere, anytime.',
    },
    {
      icon: 'sfc.svg',
      title: 'AI-Powered Tools',
      description:
        'Leverage advanced AI for editing, enhancing, and restoring images.',
    },
    {
      icon: 'tfc.svg',
      title: 'Add Text',
      description: 'Place stylish and customizable text on your images.',
    },
    {
      icon: 'restore.svg',
      title: 'Image Restore',
      description: 'Bring old or damaged photos back to life instantly.',
    },
    {
      icon: 'remove.svg',
      title: 'Object Removal',
      description: 'Erase unwanted objects seamlessly from any picture.',
    },
    {
      icon: 'stars.svg',
      title: 'Generative Fill',
      description: 'Fill missing areas or extend backgrounds naturally.',
    },
    {
      icon: 'recolor.svg',
      title: 'Object Recolor',
      description: 'Change object colors while keeping natural textures.',
    },
  ];


}
