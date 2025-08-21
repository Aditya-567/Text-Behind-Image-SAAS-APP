import { Component, ElementRef, EventEmitter, OnInit, Output, signal, ViewChild } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { BottomBarService } from '../../shared/header/bottom-bar.service';
import { AuthService } from '../../login/auth-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // ngOnInit logic
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  handleCardClick() {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/object-removal']);
    }
  }

  // CORRECTED: This method now only handles navigation
  openTBI() {
    this.router.navigate(['/text-behind-image']);
  }

  featureCards = [
    {
      icon: 'ifc.svg',
      title: 'Enhance Profile Pic',
      description: 'Write, edit, and execute code effortlessly.',
    },
    {
      icon: 'dfc.svg',
      title: 'Access it AnyTime',
      description: 'Invite team members and set up roles in just a few clicks.',
    },
    {
      icon: 'sfc.svg',
      title: 'AI',
      description:
        'Powered by OnceHub, CodeOnce ensures lightning-fast execution.',
    },
    {
      icon: 'tfc.svg',
      title: 'Add Text',
      description: 'Visualize user progress and detailed reports.',
    },
  ];
}
