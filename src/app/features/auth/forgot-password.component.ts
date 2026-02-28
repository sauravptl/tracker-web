import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Reset Password</h2>
        <p class="mb-6 text-gray-600 text-center">Enter your email address and we'll send you a link to reset your password.</p>
        
        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="email">Email</label>
            <input 
              [class.border-red-500]="resetForm.get('email')?.invalid && resetForm.get('email')?.touched"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-colors" 
              id="email" type="email" formControlName="email" placeholder="you@example.com">
            <div *ngIf="resetForm.get('email')?.invalid && resetForm.get('email')?.touched" class="text-red-500 text-xs italic mt-1">
              Please enter a valid email address.
            </div>
          </div>

          <div *ngIf="message" [class]="isError ? 'text-red-600' : 'text-green-600'" class="mb-4 text-center text-sm font-semibold">
            {{ message }}
          </div>

          <div class="flex items-center justify-between flex-col gap-4">
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full" type="submit" [disabled]="resetForm.invalid || isLoading">
              {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
            </button>
            <a routerLink="/login" class="text-blue-500 hover:text-blue-800 text-sm">Back to Login</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  resetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = false;
  message = '';
  isError = false;

  onSubmit() {
    if (this.resetForm.valid) {
      this.isLoading = true;
      this.message = '';
      this.isError = false;

      const { email } = this.resetForm.value;

      this.authService.resetPassword(email!).subscribe({
        next: () => {
          this.isLoading = false;
          this.message = 'Password reset email sent! Check your inbox.';
          this.isError = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.message = err.message || 'Failed to send reset email.';
          this.isError = true;
        }
      });
    }
  }
}
