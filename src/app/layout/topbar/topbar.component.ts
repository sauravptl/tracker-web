import { Component, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-white shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
      <div class="flex items-center">
        <!-- Hamburger Menu -->
        <button (click)="toggleSidebar.emit()" class="mr-4 lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 class="text-lg sm:text-xl font-semibold text-gray-800 truncate">{{ pageTitle }}</h2>
      </div>
      
      <div class="flex items-center space-x-4">
        <!-- User Dropdown (Simplified) -->
        <div class="relative group">
          <button class="flex items-center space-x-2 focus:outline-none p-1 rounded-full hover:bg-gray-50 transition-colors">
            <div class="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
              {{ userInitials }}
            </div>
            <span class="text-gray-700 text-sm hidden md:block font-medium">{{ userEmail }}</span>
            <svg class="h-4 w-4 text-gray-400 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <!-- Dropdown Menu -->
          <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 hidden group-hover:block border border-gray-100 ring-1 ring-black ring-opacity-5 transform origin-top-right transition-all duration-200">
            <div class="px-4 py-2 border-b border-gray-50 md:hidden">
              <p class="text-sm font-medium text-gray-900 truncate">{{ userEmail }}</p>
            </div>
            <button (click)="logout()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors flex items-center gap-2">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  `
})
export class TopbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  private router = inject(Router);
  private authService = inject(AuthService);

  pageTitle = 'Dashboard';
  userInitials = 'U';
  userEmail = '';

  ngOnInit() {
    // Listen to route changes for title
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.setPageTitle(event.url);
    });

    // Set initial title
    this.setPageTitle(this.router.url);

    // Get user info
    const user = this.authService.userSignal();
    if (user) {
      this.userEmail = user.email || '';
      this.userInitials = this.userEmail.substring(0, 2).toUpperCase();
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  private setPageTitle(url: string) {
    if (url.includes('/dashboard')) this.pageTitle = 'Dashboard';
    else if (url.includes('/tasks')) this.pageTitle = 'Tasks Board';
    else if (url.includes('/time-tracker')) this.pageTitle = 'Time Tracker';
    else if (url.includes('/hr/leaves')) this.pageTitle = 'Leave Requests';
    else if (url.includes('/hr/approvals')) this.pageTitle = 'HR Approvals';
    else if (url.includes('/hr/expenses')) this.pageTitle = 'My Expenses';
    else if (url.includes('/settings/organization')) this.pageTitle = 'Organization Settings';
    else if (url.includes('/settings/team')) this.pageTitle = 'Team Management';
    else this.pageTitle = 'TrackFlow';
  }
}
