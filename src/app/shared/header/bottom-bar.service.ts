import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BottomBarService {
  private isCollapsedSubject = new BehaviorSubject<boolean>(false);
  isCollapsed$ = this.isCollapsedSubject.asObservable();

  toggleSidebar(state: boolean) {
    this.isCollapsedSubject.next(state);
  }

  toggleFromHeader() {
    const current = this.isCollapsedSubject.value;
    this.isCollapsedSubject.next(!current);
  }
}
