import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BottomBarService } from './bottom-bar.service';

@Component({
  selector: 'app-header',
  standalone:false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  selectedTab: string = 'home';

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  constructor( private route: Router ,private bottomBarService: BottomBarService){
    
  }
  goToHome() {
    this.route.navigate(['/home']);
  }

  goToLogin() {
    this.route.navigate(['/login']);
  }

  isCollapsed: boolean = false;


  ngOnInit() {
    this.bottomBarService.isCollapsed$.subscribe((state) => {
      this.isCollapsed = state;
      console.log("Received Sidebar State in Header:", state);
    });
  }
}
