import { Component, signal, ViewChild  } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav  } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LeftNav } from './layout/left-nav/left-nav';
import { Login } from './pages/login/login';
import { Router } from '@angular/router';
import { AuthService } from '../utils/AuthService';
import { filter } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  imports: [
    MatSidenavModule,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    LeftNav,
    Login,
 
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // @ViewChild('leftSidenav') leftSidenav!: MatSidenav;

  // toggleLeft() {
  //   this.leftSidenav.toggle();
  // }

  showLayout = false;

  constructor(private router: Router, private authService: AuthService) {}

  username: string = '' ;
  password: string = '';

  checkLoggedIn() {
    if(this.authService.isAuthenticated()) {
      this.showLayout = true;
      return true;
    } else {
      this.showLayout = false;
      return false;
    }
  }

  onUserLoggedIn(token: string) {
    console.log('Token received in AppComponent:', token);
    this.showLayout = true;

    this.router.navigate(['/user-tasks']);
  }

   logout(): void {
    // Clear auth/session
    console.log('User logged out');
    localStorage.removeItem('camunda_token'); // optional: clear token
    localStorage.removeItem('username'); // ✅ remove username
    this.router.navigate(['/login']);
  }

}
