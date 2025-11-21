import { Component, OnInit } from '@angular/core';
import { MatSidenavModule, MatSidenav  } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LeftNav } from './left-nav/left-nav';
import { AuthService } from '../../utils/AuthService';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-layout',
  imports: [
    MatSidenavModule,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    LeftNav,
    RouterModule,
    MatMenuModule
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit {
  userName: string = 'Loading...';
  userInitials: string = 'L';
  isNavbarOpen: boolean = true;
  pageTitle: string = '';

  constructor(
    private authService: AuthService, 
    private http: HttpClient
  ) {
    this.pageTitle = localStorage.getItem('lastPageTitle') || 'Work';
  }

  setPageTitle(title: string) {
    this.pageTitle = title;
    localStorage.setItem('lastPageTitle', title);
  }

  ngOnInit() {
    this.fetchUserData();
  }

  toggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen;
  }

  fetchUserData() {
    this.http.get<any>('/api/user/profile').subscribe({
      next: (response) => {
        this.userName = response.name || response.fullName || 'User';
        this.userInitials = this.getInitials(this.userName);
      },
      error: (error) => {
        this.userName = this.authService.username || 'User Name';
        this.userInitials = this.getInitials(this.userName);
      }
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  logout() {
    localStorage.removeItem('lastPageTitle');    
    this.authService.logout();
  }
}
