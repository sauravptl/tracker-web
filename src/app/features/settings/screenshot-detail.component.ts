import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ScreenshotService, ScreenshotCapture } from '../../core/services/screenshot.service';
import { UserService, UserProfile } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Subscription } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';

interface DayGroup {
    date: string;
    label: string;
    captures: ScreenshotCapture[];
}

@Component({
    selector: 'app-screenshot-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    animations: [
        trigger('lightboxAnimation', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('200ms ease-out', style({ opacity: 1 }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ opacity: 0 }))
            ])
        ])
    ],
    template: `
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <a routerLink="/settings/screenshots" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ userName() }}</h1>
            <p class="text-gray-500 text-sm mt-0.5">{{ totalCaptures() }} screenshots captured</p>
          </div>
        </div>

        <!-- Date Filters -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <input type="date" [(ngModel)]="startDate" (change)="onDateChange()" class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500">
            <span class="text-gray-400 text-sm">to</span>
            <input type="date" [(ngModel)]="endDate" (change)="onDateChange()" class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500">
          </div>
          <button *ngIf="selectedCaptures().length > 0" (click)="deleteSelected()" class="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors">
            Delete ({{ selectedCaptures().length }})
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="text-center py-16">
        <div class="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-500 text-sm mt-4">Loading screenshots...</p>
      </div>

      <!-- Daily Groups -->
      <div *ngIf="!isLoading()" class="space-y-8">
        <div *ngFor="let group of dayGroups()" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <!-- Day Header -->
          <div class="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="font-semibold text-gray-900 text-sm">{{ group.label }}</span>
            </div>
            <span class="text-xs text-gray-500">{{ group.captures.length }} screenshots</span>
          </div>

          <!-- Screenshot Grid -->
          <div class="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <div
              *ngFor="let capture of group.captures"
              class="group relative rounded-lg overflow-hidden border border-gray-200 hover:border-indigo-300 transition-all cursor-pointer"
              (click)="openLightbox(capture)"
            >
              <!-- Checkbox for bulk select -->
              <div class="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity" (click)="$event.stopPropagation()">
                <input
                  type="checkbox"
                  [checked]="isSelected(capture)"
                  (change)="toggleSelect(capture)"
                  class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                >
              </div>

              <!-- Thumbnail -->
              <div class="aspect-video bg-gray-100 flex items-center justify-center">
                <img
                  *ngIf="capture.storagePath"
                  [src]="getImageUrl(capture)"
                  alt="Screenshot"
                  class="w-full h-full object-cover"
                  loading="lazy"
                >
                <svg *ngIf="!capture.storagePath" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <!-- Time label -->
              <div class="px-2 py-1.5 bg-white">
                <p class="text-xs text-gray-600 font-medium">{{ formatTime(capture.capturedAt) }}</p>
                <p class="text-[10px] text-gray-400">{{ capture.resolution }} · {{ formatSize(capture.fileSize) }}</p>
              </div>

              <!-- Hover overlay -->
              <div class="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="dayGroups().length === 0" class="text-center py-16 bg-white rounded-xl border border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-gray-500 font-medium">No screenshots found</p>
          <p class="text-gray-400 text-sm mt-1">Try adjusting the date range or wait for captures</p>
        </div>
      </div>

      <!-- Lightbox -->
      <div *ngIf="lightboxCapture()" [@lightboxAnimation] class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" (click)="closeLightbox()">
        <div class="relative max-w-5xl w-full" (click)="$event.stopPropagation()">
          <!-- Close -->
          <button (click)="closeLightbox()" class="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Image -->
          <img
            [src]="getImageUrl(lightboxCapture()!)"
            alt="Screenshot full view"
            class="w-full rounded-lg shadow-2xl"
          >

          <!-- Info bar -->
          <div class="mt-4 flex items-center justify-between text-white/80">
            <div class="flex items-center gap-4 text-sm">
              <span>{{ formatDateTime(lightboxCapture()!.capturedAt) }}</span>
              <span>{{ lightboxCapture()!.resolution }}</span>
              <span>{{ formatSize(lightboxCapture()!.fileSize) }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button (click)="downloadCapture(lightboxCapture()!)" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                Download
              </button>
              <button (click)="deleteSingleCapture(lightboxCapture()!)" class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ScreenshotDetailComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private screenshotService = inject(ScreenshotService);
    private userService = inject(UserService);
    private authService = inject(AuthService);
    private toastService = inject(ToastService);
    private subscriptions: Subscription[] = [];

    userName = signal<string>('User');
    totalCaptures = signal<number>(0);
    captures = signal<ScreenshotCapture[]>([]);
    isLoading = signal<boolean>(true);
    lightboxCapture = signal<ScreenshotCapture | null>(null);
    selectedCaptures = signal<ScreenshotCapture[]>([]);

    startDate = '';
    endDate = '';

    private orgId = '';
    private userId = '';

    dayGroups = computed<DayGroup[]>(() => {
        const capturesList = this.captures();
        const groups = new Map<string, ScreenshotCapture[]>();

        capturesList.forEach(c => {
            const date = c.date || this.formatDateKey(c.capturedAt);
            if (!groups.has(date)) {
                groups.set(date, []);
            }
            groups.get(date)!.push(c);
        });

        return Array.from(groups.entries())
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, captures]) => ({
                date,
                label: this.formatDateLabel(date),
                captures: captures.sort((a, b) => {
                    const timeA = a.capturedAt?.toDate ? a.capturedAt.toDate().getTime() : new Date(a.capturedAt).getTime();
                    const timeB = b.capturedAt?.toDate ? b.capturedAt.toDate().getTime() : new Date(b.capturedAt).getTime();
                    return timeB - timeA;
                })
            }));
    });

    async ngOnInit() {
        const user = this.authService.userSignal();
        if (!user) return;

        this.userId = this.route.snapshot.paramMap.get('userId') || '';

        // Set default date range (last 7 days)
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        this.startDate = this.toInputDate(start);
        this.endDate = this.toInputDate(end);

        // Get org id
        const sub = this.userService.getUserProfileStream(user.uid).subscribe(async profile => {
            if (!profile?.orgId) return;
            this.orgId = profile.orgId;

            // Get target user name
            const userSub = this.userService.getUserProfileStream(this.userId).subscribe(targetUser => {
                if (targetUser) {
                    this.userName.set(targetUser.displayName || targetUser.email);
                }
            });
            this.subscriptions.push(userSub);

            // Load captures
            this.loadCaptures();
        });
        this.subscriptions.push(sub);
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    loadCaptures() {
        if (!this.orgId) return;
        this.isLoading.set(true);

        const start = new Date(this.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(this.endDate);
        end.setHours(23, 59, 59, 999);

        const sub = this.screenshotService.getUserCapturesByDate(this.orgId, this.userId, start, end).subscribe(captures => {
            this.captures.set(captures);
            this.totalCaptures.set(captures.length);
            this.isLoading.set(false);
        });
        this.subscriptions.push(sub);
    }

    onDateChange() {
        if (this.startDate && this.endDate) {
            this.loadCaptures();
        }
    }

    // ========== Lightbox ==========

    openLightbox(capture: ScreenshotCapture) {
        this.lightboxCapture.set(capture);
    }

    closeLightbox() {
        this.lightboxCapture.set(null);
    }

    // ========== Selection ==========

    isSelected(capture: ScreenshotCapture): boolean {
        return this.selectedCaptures().some(c => c.id === capture.id);
    }

    toggleSelect(capture: ScreenshotCapture) {
        const current = [...this.selectedCaptures()];
        const index = current.findIndex(c => c.id === capture.id);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(capture);
        }
        this.selectedCaptures.set(current);
    }

    // ========== Actions ==========

    async deleteSelected() {
        const selected = this.selectedCaptures();
        if (!selected.length) return;

        try {
            for (const capture of selected) {
                await this.screenshotService.deleteCapture(this.orgId, this.userId, capture.id!);
            }
            this.selectedCaptures.set([]);
            this.toastService.show(`Deleted ${selected.length} screenshots`, 'success');
            this.loadCaptures();
        } catch (error) {
            this.toastService.show('Failed to delete screenshots', 'error');
        }
    }

    async deleteSingleCapture(capture: ScreenshotCapture) {
        try {
            await this.screenshotService.deleteCapture(this.orgId, this.userId, capture.id!);
            this.closeLightbox();
            this.toastService.show('Screenshot deleted', 'success');
            this.loadCaptures();
        } catch (error) {
            this.toastService.show('Failed to delete screenshot', 'error');
        }
    }

    downloadCapture(capture: ScreenshotCapture) {
        const url = this.getImageUrl(capture);
        if (url) {
            const a = document.createElement('a');
            a.href = url;
            a.download = `screenshot-${capture.date}-${capture.capturedAt}.jpg`;
            a.click();
        }
    }

    // ========== Helpers ==========

    getImageUrl(capture: ScreenshotCapture): string {
        if (!capture.storagePath) return '';
        // Firebase Storage download URL — this would typically be fetched via getDownloadURL
        // For now, construct the URL pattern
        return `https://firebasestorage.googleapis.com/v0/b/${this.getProjectBucket()}/o/${encodeURIComponent(capture.storagePath)}?alt=media`;
    }

    private getProjectBucket(): string {
        // This should come from environment config
        return 'tracker-web.appspot.com';
    }

    formatTime(timestamp: any): string {
        const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    formatDateTime(timestamp: any): string {
        const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString([], {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    formatSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    }

    private formatDateKey(timestamp: any): string {
        const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toISOString().split('T')[0];
    }

    private formatDateLabel(dateStr: string): string {
        const date = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.getTime() === today.getTime()) return 'Today';
        if (date.getTime() === yesterday.getTime()) return 'Yesterday';

        return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    }

    private toInputDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }
}
