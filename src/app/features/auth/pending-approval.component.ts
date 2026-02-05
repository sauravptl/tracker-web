import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-pending-approval',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <img src="logo.png" alt="TrackFlow Logo" class="h-16 w-auto">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Account Pending
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Your account is currently waiting for approval.
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div class="rounded-full bg-yellow-100 h-24 w-24 flex items-center justify-center mx-auto mb-6">
            <svg class="h-12 w-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Approval Required
          </h3>
          
          <p class="text-gray-500 mb-6">
            You have successfully joined the organization. An administrator needs to approve your account before you can access the dashboard.
          </p>

          <p class="text-sm text-gray-400 mb-8">
            Please contact your administrator if this takes too long.
          </p>

          <button (click)="logout()" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  `
})
export class PendingApprovalComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
