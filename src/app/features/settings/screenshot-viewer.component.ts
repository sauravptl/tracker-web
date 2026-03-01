import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ScreenshotService, UserScreenshotSummary, ScreenshotSettings } from '../../core/services/screenshot.service';
import { UserService, UserProfile } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-screenshot-viewer',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Screenshot Monitor</h1>
          <p class="text-gray-500 mt-1">View employee activity screenshots</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            {{ enabledCount() }} monitored
          </span>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="text-center py-16">
        <div class="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-500 text-sm mt-4">Loading team members...</p>
      </div>

      <!-- User Grid -->
      <div *ngIf="!isLoading()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <a
          *ngFor="let user of users()"
          [routerLink]="['/settings/screenshots', user.uid]"
          class="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all duration-200 p-5 cursor-pointer block"
        >
          <div class="flex items-start justify-between mb-4">
            <!-- Avatar -->
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
              {{ getInitials(user.displayName || user.email) }}
            </div>

            <!-- Status Badge -->
            <span class="text-xs px-2.5 py-1 rounded-full font-medium" [ngClass]="{
              'bg-green-100 text-green-700': isEnabled(user.uid),
              'bg-gray-100 text-gray-500': !isEnabled(user.uid)
            }">
              {{ isEnabled(user.uid) ? 'Active' : 'Disabled' }}
            </span>
          </div>

          <h3 class="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
            {{ user.displayName || 'Unnamed' }}
          </h3>
          <p class="text-xs text-gray-500 mt-0.5">{{ user.email }}</p>

          <!-- Stats -->
          <div class="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
            <div>
              <p class="text-xs text-gray-400">Screenshots</p>
              <p class="text-lg font-bold text-gray-900">{{ getSummary(user.uid)?.totalCaptures || 0 }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400">Last Capture</p>
              <p class="text-xs font-medium text-gray-600 mt-1">
                {{ getLastCaptureText(user.uid) }}
              </p>
            </div>
          </div>

          <!-- View arrow -->
          <div class="mt-3 flex items-center gap-1 text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View screenshots
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>

        <!-- Empty state -->
        <div *ngIf="users().length === 0" class="col-span-full text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-gray-500">No team members found</p>
          <p class="text-gray-400 text-sm mt-1">Add team members to start monitoring</p>
        </div>
      </div>
    </div>
  `
})
export class ScreenshotViewerComponent implements OnInit, OnDestroy {
    private screenshotService = inject(ScreenshotService);
    private userService = inject(UserService);
    private authService = inject(AuthService);
    private subscriptions: Subscription[] = [];

    users = signal<UserProfile[]>([]);
    summaries = signal<Map<string, UserScreenshotSummary>>(new Map());
    enabledUsers = signal<string[]>([]);
    enabledCount = signal<number>(0);
    isLoading = signal<boolean>(true);

    private orgId = '';

    async ngOnInit() {
        const user = this.authService.userSignal();
        if (!user) return;

        const sub = this.userService.getUserProfileStream(user.uid).subscribe(async profile => {
            if (!profile?.orgId) return;
            this.orgId = profile.orgId;

            // Load users
            const usersSub = this.userService.getOrgUsers(this.orgId).subscribe(users => {
                this.users.set(users.filter(u => u.status === 'active'));
                this.isLoading.set(false);
            });
            this.subscriptions.push(usersSub);

            // Load screenshot summaries
            const summSub = this.screenshotService.getUserScreenshotSummaries(this.orgId).subscribe(summaries => {
                const map = new Map<string, UserScreenshotSummary>();
                summaries.forEach(s => map.set(s.userId, s));
                this.summaries.set(map);
            });
            this.subscriptions.push(summSub);

            // Load settings
            const settings = await this.screenshotService.getScreenshotSettings(this.orgId);
            if (settings) {
                this.enabledUsers.set(settings.enabledUsers || []);
                this.enabledCount.set(this.enabledUsers().length);
            }
        });
        this.subscriptions.push(sub);
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    isEnabled(userId: string): boolean {
        return this.enabledUsers().includes(userId);
    }

    getSummary(userId: string): UserScreenshotSummary | undefined {
        return this.summaries().get(userId);
    }

    getLastCaptureText(userId: string): string {
        const summary = this.summaries().get(userId);
        if (!summary?.lastCapturedAt) return 'Never';

        const date = summary.lastCapturedAt.toDate ? summary.lastCapturedAt.toDate() : new Date(summary.lastCapturedAt);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    }

    getInitials(name: string): string {
        return name
            .split(/[\s@]+/)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join('');
    }
}
