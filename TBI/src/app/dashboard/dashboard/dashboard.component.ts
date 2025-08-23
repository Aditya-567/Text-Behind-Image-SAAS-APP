import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../login/auth-service.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  showLoginPopup = false;
  showScrollTop = false;

  constructor(private router: Router, private authService: AuthService) {
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

  handleCardClick() {
    if (!this.isLoggedIn()) {
      this.showLoginPopup = true;
    } else {
      this.router.navigate(['/object-removal']);
    }
  }

  closeLoginPopup() {
    this.showLoginPopup = false;
  }

  navigateToLogin() {
    this.showLoginPopup = false;
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.showLoginPopup = false;
    this.router.navigate(['/register']);
  }

  // Handle TBI navigation with login check
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  openTBI() {
    if (!this.isLoggedIn()) {
      this.showLoginPopup = true;
    } else {
      this.router.navigate(['/text-behind-image']);
    }
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

  featureCardsSecond = [
    {
      icon: 'social.svg',
      title: 'Enhance Profile Picture',
    },
    {
      icon: 'pic.svg',
      title: 'Edit Images Anywhere',
    },
    {
      icon: 'aistart.svg',
      title: 'AI-Powered Image Enhancement',
    },
    {
      icon: 'ui.svg',
      title: 'Simple, intuitive, and fast editing experience.',
    },
    {
      icon: 'pay.svg',
      title: 'Secure & Reliable Payments',
    },
  ];

  steps = [
    {
      number: '1',
      Image: 'service-h.svg',
      title: 'Select Service',
      description: 'The service you want to use',
    },
    {
      number: '2',
      Image: 'upload-h.svg',
      title: 'Upload Photo',
      description: 'Upload any image from your device',
    },

    {
      number: '3',
      Image: 'edit-h.svg',
      title: 'Edit the Image',
      description: 'Make any adjustments you need',
    },
    {
      number: '4',
      Image: 'download-h.svg',
      title: 'Download',
      description: 'Export in high quality format',
    },
  ];
}
