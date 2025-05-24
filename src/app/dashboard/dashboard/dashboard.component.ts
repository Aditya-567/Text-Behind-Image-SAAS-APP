import { Component, EventEmitter, Output, signal } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { BottomBarService } from '../../shared/header/bottom-bar.service';
import { AuthService } from '../../login/auth-service.service';

@Component({
  selector: 'app-dashboard',
  standalone:false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  animations: [
    trigger('slideTransition', [
      transition(':increment', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':decrement', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
    ]),
  ],
})
export class DashboardComponent {
  isDragging = signal(false);
  imageSrc: string | ArrayBuffer | null = null;
  activeTab: number = 0;
  @Output() barToggle = new EventEmitter<boolean>();
  isCollapsed: boolean = false; 

 constructor(private bottomBarService: BottomBarService,
  private authservice: AuthService,
 ) {}

 openTBI() {
  this.isCollapsed = !this.isCollapsed;
  console.log("Sidebar state changed to:", this.isCollapsed);
  this.bottomBarService.toggleSidebar(this.isCollapsed);
}

closeTBI() {
  this.isCollapsed = !this.isCollapsed;
  console.log("Sidebar state changed to:", this.isCollapsed);
  this.bottomBarService.toggleSidebar(this.isCollapsed);
}

  selectTab(index: number) {
    this.activeTab = index;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.readImage(file);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.readImage(file);
    }
  }

  readImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageSrc = reader.result;
    };
    reader.readAsDataURL(file);
  }
}
