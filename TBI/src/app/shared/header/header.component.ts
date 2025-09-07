import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { filter } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../../login/auth-service.service';
import { LoginPopupService } from '../../services/login-pop-up.service';
import { ToasterService } from '../../services/toaster.service';
import { BottomBarService } from './bottom-bar.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  animations: [
    trigger('expandCollapse', [
      state('expanded', style({ height: '*', opacity: 1 })),
      state('collapsed', style({ height: '0px', opacity: 0 })),
      transition('expanded <=> collapsed', animate('2000ms ease-in-out')),
    ]),
  ],
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  private observer!: IntersectionObserver;

  scrollToGuide() {
    this.selectedTab = 'Guide';
    this.closeProfile();
    this.route.navigate(['/home']).then(() => {
      setTimeout(() => {
        const guideElement = document.getElementById('Guide');
        if (guideElement) {
          guideElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    });
  }
  selectedTab: string = 'home';
  isCollapsed: boolean = false;
  userImg = '';
  userName = '';
  userEmail = '';
  lastSignInTime = '';
  creationTime = '';
  profileOpen = signal(false);
  profilePopUpOpen = signal(false);
  showFallback: boolean = false;
  isMenuOpen: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.closeProfile();
  }

  // Close menu and profile when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Handle menu dropdown
    const menuContainer = document.querySelector('.menu-container');
    if (menuContainer && !menuContainer.contains(event.target as Node)) {
      this.isMenuOpen = false;
    }

    // Handle profile dropdown
    const profileButton = document.querySelector('.profile-button');
    const profileDropdown = document.querySelector('.profile-dropdown');
    const target = event.target as HTMLElement;

    // Check if the click is not inside profile button or dropdown
    if (profileDropdown && profileButton) {
      const isOutsideClick =
        !profileDropdown.contains(target) && !profileButton.contains(target);
      // Check if we're not clicking edit/save/cancel buttons
      const isActionButton = target.closest('button[class*="cursor-pointer"]');

      if (isOutsideClick && !isActionButton) {
        this.profileOpen.set(false);
        this.profilePopUpOpen.set(false);
      }
    }
  }

  setSelectedTab(tab: string) {
    this.selectedTab = tab;
  }

  constructor(
    public route: Router,
    private bottomBarService: BottomBarService,
    public authService: AuthService,
    public toasterService: ToasterService,
    private loginPopupService: LoginPopupService // Injected the service
  ) {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.userImg = user.photoURL || '';
        this.userName = user.displayName || '';
        this.userEmail = user.email || '';
        const date = new Date(user.metadata.lastSignInTime || '');
        this.lastSignInTime = date.toDateString();
        const creationdate = new Date(user.metadata.creationTime || '');
        this.creationTime = creationdate.toDateString();
      }
    });
  }

  ngOnInit() {
    this.bottomBarService.isCollapsed$.subscribe((state) => {
      this.isCollapsed = state;
    });

    this.route.events.subscribe(() => {
      this.isCollapsed = this.route.url === '/text-behind-image';
    });
  }

  ngAfterViewInit() {
    this.route.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        if (event.urlAfterRedirects === '/home') {
          setTimeout(() => this.observeGuideSection(), 0);
        } else {
          this.unobserveGuideSection();
        }
      });

    if (this.route.url === '/home') {
      setTimeout(() => this.observeGuideSection(), 0);
    }
  }

  ngOnDestroy() {
    this.unobserveGuideSection();
  }

  observeGuideSection() {
    this.unobserveGuideSection();

    const guideElement = document.getElementById('Guide');
    if (guideElement) {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5,
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.selectedTab = 'Guide';
          } else {
            if (this.route.url === '/home') {
              this.selectedTab = 'home';
            }
          }
        });
      }, options);

      this.observer.observe(guideElement);
    }
  }

  unobserveGuideSection() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private closeProfile() {
    this.profileOpen.set(false);
    this.profilePopUpOpen.set(false);
  }

  goToHome() {
    this.selectedTab = 'home';
    this.closeProfile();
    this.route.navigate(['/home']);
  }

  navigateToAboutUs() {
    this.selectedTab = '';
    this.closeProfile();
    this.route.navigate(['/about-us']);
  }

  /**
   * Opens the login popup with the 'Sign Up' form active.
   */
  goToLogin() {
    this.loginPopupService.open(true); // true = show Sign Up form
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  /**
   * If the user is not logged in, it opens the login popup with the 'Sign In' form active.
   * Otherwise, it navigates to the intended feature.
   */
  handleCardClick() {
    if (!this.isLoggedIn()) {
      this.loginPopupService.open(false); // false = show Sign In form
    } else {
      this.closeProfile();
      // Continue to object removal functionality
      this.route.navigate(['/object-removal']);
    }
  }

  logout() {
    this.authService.signOut().then(() => {
      this.openProfile();
      this.isCollapsed = false;
      this.route.navigate(['/home']); // Navigate to home after logout
    });
  }

  openProfile() {
    this.profileOpen.set(!this.profileOpen());
    this.profilePopUpOpen.set(false);
  }

  openProfilePopUp() {
    this.profilePopUpOpen.set(!this.profilePopUpOpen());
  }

  triggerImageUpload() {
    this.fileInput.nativeElement.click();
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const storage = getStorage();
      const fileRef = ref(storage, `profile-images/${uuidv4()}`);

      uploadBytes(fileRef, file)
        .then(() => getDownloadURL(fileRef))
        .then((url) => {
          this.userImg = url;
          console.log('✅ Image uploaded:', url);
        })
        .catch((err) => {
          console.error('❌ Image upload failed:', err);
        });
    }
  }

  updateProfile() {
    this.authService
      .updateUserProfile(this.userName, this.userImg)
      .then(() => {
        this.toasterService.show('Profile updated successfully', 'success');
        this.openProfilePopUp(); // close popup if needed
      })
      .catch((err) => {
        this.toasterService.show('Failed to update profile', 'error');
      });
  }

  saveProfile() {
    this.updateProfile();
  }

  onImgError() {
    this.showFallback = true;
  }

  onToggleClick() {
    this.bottomBarService.toggleFromHeader(); // use new toggle logic
  }
}
