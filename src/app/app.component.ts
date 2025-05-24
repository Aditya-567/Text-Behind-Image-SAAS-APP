import { Component} from '@angular/core';
import { User } from './login/user.model';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  isCollapsed = false;
  currentUser: User | null = null;

  constructor() {}


  toggleBar(state: boolean) {
    this.isCollapsed = state;
  }
}
