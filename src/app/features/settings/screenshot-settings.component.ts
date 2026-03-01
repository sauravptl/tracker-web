import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScreenshotService, ScreenshotSettings } from '../../core/services/screenshot.service';
import { UserService, UserProfile } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-screenshot-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Screenshot Settings</h1>
        <p class="text-gray-500 mt-1">Configure stealth screenshot monitoring for your team</p>
      </div>

      <!-- Global Settings Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Global Configuration</h2>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <!-- Interval -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Capture Interval</label>
            <select [(ngModel)]="intervalMinutes" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3 border">
              <option [value]="5">Every 5 minutes</option>
              <option [value]="10">Every 10 minutes</option>
              <option [value]="15">Every 15 minutes</option>
              <option [value]="30">Every 30 minutes</option>
            </select>
          </div>

          <!-- Quality -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Screenshot Quality</label>
            <select [(ngModel)]="quality" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3 border">
              <option value="low">Low (faster upload)</option>
              <option value="medium">Medium (recommended)</option>
              <option value="high">High (best quality)</option>
            </select>
          </div>

          <!-- Retention -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Retention Period</label>
            <select [(ngModel)]="retentionDays" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3 border">
              <option [value]="7">7 days</option>
              <option [value]="14">14 days</option>
              <option [value]="30">30 days</option>
              <option [value]="60">60 days</option>
              <option [value]="90">90 days</option>
            </select>
          </div>
        </div>

        <button
          (click)="saveGlobalSettings()"
          [disabled]="!canSave()"
          class="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {{ isSaving() ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>

      <!-- Employee List Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Employee Monitoring</h2>
          <span class="text-sm text-gray-500">{{ enabledCount() }} of {{ users().length }} enabled</span>
        </div>

        <!-- Search -->
        <div class="relative mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            placeholder="Search employees..."
            class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
        </div>

        <!-- Loading -->
        <div *ngIf="isLoading()" class="text-center py-8">
          <div class="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
          <p class="text-gray-500 text-sm mt-3">Loading team members...</p>
        </div>

        <!-- Employee Table -->
        <div *ngIf="!isLoading()" class="divide-y divide-gray-100">
          <div
            *ngFor="let user of filteredUsers()"
            class="flex items-center justify-between py-3.5 px-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div class="flex items-center gap-3">
              <!-- Avatar -->
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                {{ getInitials(user.displayName || user.email) }}
              </div>
              <div>
                <p class="font-medium text-gray-900 text-sm">{{ user.displayName || 'Unnamed' }}</p>
                <p class="text-xs text-gray-500">{{ user.email }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-xs px-2 py-1 rounded-full" [ngClass]="{
                'bg-green-100 text-green-700': isUserEnabled(user.uid),
                'bg-gray-100 text-gray-500': !isUserEnabled(user.uid)
              }">
                {{ isUserEnabled(user.uid) ? 'Monitoring' : 'Disabled' }}
              </span>

              <!-- Toggle -->
              <label class="relative inline-flex items-center" [class.cursor-not-allowed]="!canSave()" [class.cursor-pointer]="canSave()">
                <input
                  type="checkbox"
                  [disabled]="!canSave()"
                  [checked]="isUserEnabled(user.uid)"
                  (change)="toggleUser(user.uid)"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          <div *ngIf="filteredUsers().length === 0" class="text-center py-8">
            <p class="text-gray-500 text-sm">No employees found</p>
          </div>
        </div>
        
        <!-- Redacted Access Denied -->
        <div *ngIf="!isLoading() && !isAdminUser()" class="text-center py-8 text-red-600 bg-red-50 rounded-lg">
            <p class="font-medium">Access Denied</p>
            <p class="text-sm mt-1">You must be an administrator to manage these settings.</p>
        </div>
      </div>
    </div>
  `
})
export class ScreenshotSettingsComponent implements OnInit, OnDestroy {
  private screenshotService = inject(ScreenshotService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private subscriptions: Subscription[] = [];

  users = signal<UserProfile[]>([]);
  enabledUsers = signal<string[]>([]);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  isLoaded = signal<boolean>(false); // Track if orgId and settings are ready
  isAdminUser = signal<boolean>(false);
  searchTerm = '';

  // Global settings
  intervalMinutes = 10;
  quality: 'low' | 'medium' | 'high' = 'medium';
  retentionDays = 30;

  private orgId = '';

  enabledCount = signal<number>(0);

  // Helper to check if saving is allowed
  canSave(): boolean {
    return !!this.orgId && !this.isSaving() && this.isLoaded() && this.isAdminUser();
  }

  filteredUsers(): UserProfile[] {
    const term = this.searchTerm.toLowerCase();
    if (!term) return this.users();
    return this.users().filter(u =>
      (u.displayName?.toLowerCase().includes(term)) ||
      u.email.toLowerCase().includes(term)
    );
  }

  async ngOnInit() {
    const user = this.authService.userSignal();
    if (!user) return;

    // Get user profile to find orgId and verify role
    const sub = this.userService.getUserProfileStream(user.uid).subscribe(async (profile: UserProfile | undefined) => {
      if (!profile) return;

      this.isAdminUser.set(profile.role === 'admin');

      // If not admin, stop here (Routing guard should prevent this, but extra safety)
      if (profile.role !== 'admin') {
        this.isLoading.set(false);
        return;
      }

      if (!profile.orgId) return;
      this.orgId = profile.orgId;

      // Load org users
      const usersSub = this.userService.getOrgUsers(this.orgId).subscribe((users: UserProfile[]) => {
        this.users.set(users.filter((u: UserProfile) => u.status === 'active'));
        // Don't set isLoading(false) until settings are also fetched
      });
      this.subscriptions.push(usersSub);

      // Load screenshot settings
      try {
        const settings = await this.screenshotService.getScreenshotSettings(this.orgId);
        if (settings) {
          this.enabledUsers.set(settings.enabledUsers || []);
          this.intervalMinutes = settings.intervalMinutes || 10;
          this.quality = settings.quality || 'medium';
          this.retentionDays = settings.retentionDays || 30;
          this.enabledCount.set(this.enabledUsers().length);
        }
        this.isLoaded.set(true);
      } catch (error) {
        console.error('Error loading settings:', error);
        this.toastService.show('Failed to load settings', 'error');
      } finally {
        this.isLoading.set(false);
      }
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  isUserEnabled(userId: string): boolean {
    return this.enabledUsers().includes(userId);
  }

  async toggleUser(userId: string) {
    if (!this.canSave()) {
      this.toastService.show('Wait for settings to load...', 'warning');
      return;
    }

    const current = [...this.enabledUsers()];
    const index = current.indexOf(userId);

    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(userId);
    }

    // Optimistic update
    this.enabledUsers.set(current);
    this.enabledCount.set(current.length);

    // Save immediately
    try {
      const user = this.authService.userSignal();
      await this.screenshotService.saveScreenshotSettings(this.orgId, {
        enabledUsers: current
      }, user!.uid);
    } catch (error) {
      this.toastService.show('Failed to update user setting', 'error');
      // Revert on failure (simple revert for now)
      this.ngOnInit();
    }
  }

  async saveGlobalSettings() {
    if (!this.canSave()) {
      this.toastService.show('Insufficient permissions or data not loaded', 'error');
      return;
    }

    this.isSaving.set(true);
    try {
      const user = this.authService.userSignal();
      await this.screenshotService.saveScreenshotSettings(this.orgId, {
        intervalMinutes: Number(this.intervalMinutes),
        quality: this.quality,
        retentionDays: Number(this.retentionDays),
        enabledUsers: this.enabledUsers()
      }, user!.uid);
      this.toastService.show('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Save error:', error);
      this.toastService.show('Failed to save settings', 'error');
    } finally {
      this.isSaving.set(false);
    }
  }

  getInitials(name: string): string {
    return name
      .split(/[\s@]+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }
}
