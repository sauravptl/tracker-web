import { Component, inject, OnInit, signal, Input, Output, EventEmitter, effect } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="bg-slate-900 text-white w-64 min-h-screen flex flex-col h-full shadow-2xl transition-all duration-300">
      <div class="p-6 border-b border-slate-800 flex justify-between items-center h-20">
        <div class="flex items-center justify-center w-full lg:w-auto">
          <img src="logo.svg" alt="TrackFlow Logo" class="h-10 w-auto bg-white rounded-lg p-1">
        </div>
        <button (click)="closeSidebar.emit()" class="lg:hidden text-gray-400 hover:text-white focus:outline-none transition-colors">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <a routerLink="/dashboard" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group" (click)="closeSidebar.emit()">
          <svg class="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span class="font-medium">Dashboard</span>
        </a>
        <a routerLink="/projects" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group" (click)="closeSidebar.emit()">
          <svg class="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span class="font-medium">Projects</span>
        </a>
        <a routerLink="/tasks" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group" (click)="closeSidebar.emit()">
          <svg class="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span class="font-medium">Tasks</span>
        </a>
        <a routerLink="/time-tracker" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group" (click)="closeSidebar.emit()">
          <svg class="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-medium">My Time</span>
        </a>
        <a routerLink="/reports" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group" (click)="closeSidebar.emit()">
          <svg class="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span class="font-medium">Reports</span>
        </a>
        
        <div class="pt-8 pb-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
          HR Management
        </div>
        <a routerLink="/hr/leaves" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group" (click)="closeSidebar.emit()">
          <svg class="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="font-medium">Leave Requests</span>
        </a>
        <a routerLink="/hr/expenses" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group" (click)="closeSidebar.emit()">
          <svg class="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-medium">My Expenses</span>
        </a>

        <ng-container *ngIf="isManagerOrAdmin()">
          <div class="pt-4 pb-2"></div>
          <a routerLink="/hr/approvals" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group" (click)="closeSidebar.emit()">
            <svg class="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium">Leave Approvals</span>
          </a>
          <a routerLink="/hr/expense-approvals" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group" (click)="closeSidebar.emit()">
            <svg class="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium">Expense Approvals</span>
          </a>
        </ng-container>
        
        <ng-container *ngIf="isAdmin()">
          <div class="pt-8 pb-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
            Configuration
          </div>
          <a routerLink="/settings/organization" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group" (click)="closeSidebar.emit()">
            <svg class="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span class="font-medium">Organization</span>
          </a>
          <a routerLink="/settings/team" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group" (click)="closeSidebar.emit()">
            <svg class="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span class="font-medium">Team & Roles</span>
          </a>
        </ng-container>
      </nav>
      <div class="p-6 border-t border-slate-800 bg-slate-900/50">
        <p class="text-xs text-slate-500 font-medium">TrackFlow v0.1.0</p>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  private authService = inject(AuthService);
  private userService = inject(UserService);

  role = signal<string>('employee');
  isManagerOrAdmin = signal(false);
  isAdmin = signal(false);

  constructor() {
    effect(() => {
      const user = this.authService.userSignal();
      if (user) {
        this.userService.getUserProfileStream(user.uid).subscribe(profile => {
          if (profile) {
            this.role.set(profile.role);
            this.isAdmin.set(profile.role === 'admin');
            this.isManagerOrAdmin.set(profile.role === 'admin' || profile.role === 'manager');
          }
        });
      } else {
        this.role.set('employee');
        this.isAdmin.set(false);
        this.isManagerOrAdmin.set(false);
      }
    });
  }
}
