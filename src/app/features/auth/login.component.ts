import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900">Login to TrackFlow</h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Welcome back! Please sign in to your account.
          </p>
        </div>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700" for="email">Email Address</label>
              <div class="mt-1">
                <input 
                  [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all" 
                  id="email" type="email" formControlName="email" placeholder="you@example.com">
              </div>
              <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="text-red-500 text-xs mt-1">
                <span *ngIf="loginForm.get('email')?.errors?.['required']">Email is required.</span>
                <span *ngIf="loginForm.get('email')?.errors?.['email']">Please enter a valid email address.</span>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700" for="password">Password</label>
              <div class="mt-1 relative">
                <input 
                  [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all pr-10" 
                  id="password" [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="********">
                <button type="button" (click)="togglePasswordVisibility()" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                  <svg *ngIf="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg *ngIf="showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.057 10.057 0 01-1.564 3.029m-3.286-3.286l3.59 3.59M3 3l18 18" />
                  </svg>
                </button>
              </div>
              <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="text-red-500 text-xs mt-1">
                <span *ngIf="loginForm.get('password')?.errors?.['required']">Password is required.</span>
                <span *ngIf="loginForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters.</span>
              </div>
              <div class="text-right mt-1">
                <a routerLink="/forgot-password" class="text-xs text-blue-600 hover:text-blue-800 font-medium">Forgot Password?</a>
              </div>
            </div>
          </div>

          <div>
            <button class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm" type="submit">
              Sign In
            </button>
          </div>
          
          <div class="text-center text-sm">
            <span class="text-gray-600">Don't have an account?</span>
            <a routerLink="/register" class="font-medium text-blue-600 hover:text-blue-500 ml-1">Register now</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email!, password!).subscribe({
        next: async (userCredential) => {
          try {
            const profile = await firstValueFrom(this.userService.getUserProfile(userCredential.user.uid));
            if (profile && profile.orgId) {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/onboarding']);
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
            // Fallback to dashboard or onboarding if profile fetch fails? 
            // Better to go to onboarding or error.
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => alert(err.message)
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
