import { Component, EventEmitter, Output  } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../utils/AuthService';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  @Output() loginSuccess = new EventEmitter<string>(); // emits token

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/user-tasks']);
    }
  }

  

  onLogin() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (res: any) => {
        console.log('Login successful:', res);
        localStorage.setItem('access_token', res);

        this.router.navigate(['/user-tasks']);

        this.loading = false;
      },
      error: (err) => {
        console.error('Login error:', err);
        this.errorMessage = 'Invalid credentials or server error';
        this.loading = false;
      }
    });
  }

}
