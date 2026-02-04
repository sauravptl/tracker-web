import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, CommonModule],
  template: `
    <div class="flex h-screen bg-gray-100 overflow-hidden">
      <!-- Mobile Sidebar Backdrop -->
      <div 
        *ngIf="sidebarOpen()" 
        (click)="sidebarOpen.set(false)"
        class="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden transition-opacity duration-300">
      </div>

      <!-- Sidebar -->
      <app-sidebar 
        [isOpen]="sidebarOpen()"
        (closeSidebar)="sidebarOpen.set(false)"
        class="fixed inset-y-0 left-0 z-30 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out w-64"
        [class.-translate-x-full]="!sidebarOpen()">
      </app-sidebar>

      <div class="flex-1 flex flex-col overflow-hidden w-full">
        <app-topbar (toggleSidebar)="toggleSidebar()" />
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  sidebarOpen = signal(false);

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }
}
