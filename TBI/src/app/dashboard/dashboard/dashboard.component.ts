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
}
