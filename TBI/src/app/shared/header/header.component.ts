import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  ElementRef,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../../login/auth-service.service';
import { BottomBarService } from './bottom-bar.service';
import { ToasterService } from '../../services/toaster.service';

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
export class HeaderComponent implements OnInit {
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
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  constructor(
    public route: Router,
    private bottomBarService: BottomBarService,
    public authService: AuthService,
    public toasterService: ToasterService
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
  goToHome() {
    this.route.navigate(['/home']);
  }

  goToLogin() {
    this.route.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  handleCardClick() {
    if (!this.isLoggedIn()) {
      this.route.navigate(['/login']);
    } else {
      // Continue to object removal functionality
      this.route.navigate(['/object-removal']);
    }
  }

  logout() {
    this.authService.signOut().then(() => {
      this.openProfile();
      this.isCollapsed = false;
      this.route.navigate(['/login']);
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
