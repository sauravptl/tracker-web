import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900">Create Account</h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Join TrackFlow today.
          </p>
        </div>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700" for="email">Email Address</label>
              <div class="mt-1">
                <input 
                  [class.border-red-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all" 
                  id="email" type="email" formControlName="email" placeholder="you@example.com">
              </div>
              <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="text-red-500 text-xs mt-1">
                <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required.</span>
                <span *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email address.</span>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700" for="password">Password</label>
              <div class="mt-1">
                <input 
                  [class.border-red-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all" 
                  id="password" type="password" formControlName="password" placeholder="********">
              </div>
              <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="text-red-500 text-xs mt-1">
                <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required.</span>
                <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters.</span>
              </div>
            </div>
          </div>

          <div>
            <button class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm" type="submit" [disabled]="registerForm.invalid">
              Sign Up
            </button>
          </div>
          
          <div class="text-center text-sm">
            <span class="text-gray-600">Already have an account?</span>
            <a routerLink="/login" class="font-medium text-blue-600 hover:text-blue-500 ml-1">Log in</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      this.authService.register(email!, password!).subscribe({
        next: async (userCredential) => {
          try {
            await this.userService.createUserProfile({
              uid: userCredential.user.uid,
              email: email!,
              role: 'employee', // Default role, promoted to admin if they create org
            });
            this.router.navigate(['/onboarding']);
          } catch (error: any) {
            console.error('Error creating profile:', error);
            alert('Error creating profile: ' + error.message);
          }
        },
        error: (err) => alert(err.message)
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
