import { Component, Input, Output, EventEmitter, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserProfile } from '../../../core/services/user.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

@Component({
  selector: 'app-multi-select-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, ClickOutsideDirective],
  template: `
    <div class="relative" (clickOutside)="isOpen.set(false)">
      <!-- Dropdown Trigger -->
      <button 
        type="button"
        (click)="toggleDropdown($event)"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        [class.border-red-500]="invalid"
      >
        <div class="flex flex-wrap gap-1 items-center overflow-hidden max-h-20">
          <span *ngIf="selectedUsers().length === 0" class="text-gray-400 text-sm">Select users...</span>
          
          <div *ngFor="let user of selectedUsersDisplay()" class="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full border border-blue-200">
            <span>{{ user.displayName || user.email }}</span>
            <span (click)="removeUser($event, user.uid)" class="cursor-pointer hover:text-blue-900 font-bold ml-1">×</span>
          </div>
          
          <span *ngIf="remainingCount() > 0" class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            +{{ remainingCount() }} more
          </span>
        </div>
        
        <svg class="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <div *ngIf="isOpen()" class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
        <!-- Search Input -->
        <div class="sticky top-0 bg-white px-2 py-2 border-b border-gray-100">
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (ngModelChange)="filterUsers()"
            placeholder="Search users..." 
            class="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
            (click)="$event.stopPropagation()"
          >
        </div>

        <!-- Options -->
        <div *ngFor="let user of filteredUsers()" 
             (click)="toggleSelection(user.uid)"
             class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 transition-colors flex items-center gap-3">
          
          <div class="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {{ getUserInitials(user) }}
          </div>
          
          <div class="flex flex-col truncate">
            <span class="font-medium truncate text-gray-900">{{ user.displayName || 'Unknown' }}</span>
            <span class="text-xs text-gray-500 truncate">{{ user.email }}</span>
          </div>

          <span *ngIf="isSelected(user.uid)" class="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </span>
        </div>

        <div *ngIf="filteredUsers().length === 0" class="py-2 px-3 text-gray-500 italic text-center">
          No users found.
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MultiSelectDropdownComponent {
  @Input() users: UserProfile[] = [];
  @Input() selectedIds: string[] = [];
  @Input() invalid = false;
  @Output() selectionChange = new EventEmitter<string[]>();

  isOpen = signal(false);
  searchTerm = '';

  // Internal signal for filtered list to avoid mutating props
  filteredUsers = signal<UserProfile[]>([]);

  // Computed for display
  selectedUsers = computed(() => {
    return this.users.filter(u => this.selectedIds.includes(u.uid));
  });

  selectedUsersDisplay = computed(() => {
    return this.selectedUsers().slice(0, 3); // Show max 3 tags
  });

  remainingCount = computed(() => {
    return Math.max(0, this.selectedUsers().length - 3);
  });

  constructor() {
    effect(() => {
      // Initialize filtered list when users input changes
      this.filterUsers();
    });
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.searchTerm = '';
      this.filterUsers();
    }
  }

  filterUsers() {
    if (!this.searchTerm) {
      this.filteredUsers.set(this.users);
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers.set(
      this.users.filter(u =>
        (u.displayName?.toLowerCase().includes(term) || '') ||
        (u.email?.toLowerCase().includes(term) || '')
      )
    );
  }

  toggleSelection(uid: string) {
    const current = [...this.selectedIds];
    const index = current.indexOf(uid);

    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(uid);
    }

    this.selectionChange.emit(current);
  }

  isSelected(uid: string): boolean {
    return this.selectedIds.includes(uid);
  }

  removeUser(event: Event, uid: string) {
    event.stopPropagation();
    const current = this.selectedIds.filter(id => id !== uid);
    this.selectionChange.emit(current);
  }

  getUserInitials(user: UserProfile): string {
    if (user.displayName) {
      return user.displayName.substring(0, 2).toUpperCase();
    }
    return (user.email || '?').substring(0, 2).toUpperCase();
  }
}
