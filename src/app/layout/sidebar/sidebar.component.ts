import { Component, inject, OnInit, signal, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="bg-gray-800 text-white w-64 min-h-screen flex flex-col h-full shadow-xl">
      <div class="p-4 border-b border-gray-700 flex justify-between items-center h-16">
        <h1 class="text-2xl font-bold tracking-wider text-blue-400">TrackFlow</h1>
        <button (click)="closeSidebar.emit()" class="lg:hidden text-gray-400 hover:text-white focus:outline-none">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <a routerLink="/dashboard" routerLinkActive="bg-gray-700 text-white" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors" (click)="closeSidebar.emit()">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span>Dashboard</span>
        </a>
        <a routerLink="/tasks" routerLinkActive="bg-gray-700 text-white" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors" (click)="closeSidebar.emit()">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span>Tasks</span>
        </a>
        <a routerLink="/time-tracker" routerLinkActive="bg-gray-700 text-white" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors" (click)="closeSidebar.emit()">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>My Time</span>
        </a>
        
        <div class="pt-6 pb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
          HR
        </div>
        <a routerLink="/hr/leaves" routerLinkActive="bg-gray-700 text-white" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors" (click)="closeSidebar.emit()">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Leave Requests</span>
        </a>
        <a routerLink="/hr/expenses" routerLinkActive="bg-gray-700 text-white" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors" (click)="closeSidebar.emit()">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>My Expenses</span>
        </a>

        <ng-container *ngIf="isManagerOrAdmin()">
          <a routerLink="/hr/approvals" routerLinkActive="bg-gray-700 text-white" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors" (click)="closeSidebar.emit()">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Leave Approvals</span>
          </a>
          <a routerLink="/hr/expense-approvals" routerLinkActive="bg-gray-700 text-white" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors" (click)="closeSidebar.emit()">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Expense Approvals</span>
          </a>
        </ng-container>
        
        <ng-container *ngIf="isAdmin()">
          <div class="pt-6 pb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Settings
          </div>
          <a routerLink="/settings/organization" routerLinkActive="bg-gray-700 text-white" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors" (click)="closeSidebar.emit()">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Organization</span>
          </a>
          <a routerLink="/settings/team" routerLinkActive="bg-gray-700 text-white" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors" (click)="closeSidebar.emit()">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Team</span>
          </a>
        </ng-container>
      </nav>
      <div class="p-4 border-t border-gray-700">
        <p class="text-xs text-gray-500">TrackFlow v0.1.0</p>
      </div>
    </aside>
  `
})
export class SidebarComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  private authService = inject(AuthService);
  private userService = inject(UserService);

  role = signal<string>('employee');
  isManagerOrAdmin = signal(false);
  isAdmin = signal(false);

  async ngOnInit() {
    const user = this.authService.userSignal();
    if (user) {
      try {
        const profile = await firstValueFrom(this.userService.getUserProfile(user.uid));
        if (profile) {
          this.role.set(profile.role);
          this.isAdmin.set(profile.role === 'admin');
          this.isManagerOrAdmin.set(profile.role === 'admin' || profile.role === 'manager');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }
  }
}
