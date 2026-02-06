import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeLogService } from '../../../../core/services/time-log.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-timer-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute top-0 left-0 w-full h-1" 
        [ngClass]="{
          'bg-gradient-to-r from-blue-500 to-indigo-600': sessionType() === 'work' || !isActive(),
          'bg-gradient-to-r from-amber-400 to-orange-500': sessionType() === 'break'
        }">
      </div>

      <div class="relative z-10">
        <!-- Time Display -->
        <div class="text-center mb-6">
          <div class="text-5xl font-mono font-bold tracking-tight text-gray-900 mb-2">
            {{ display() }}
          </div>
          <div class="flex items-center justify-center gap-2 text-sm font-medium"
            [ngClass]="{
              'text-blue-600': sessionType() === 'work',
              'text-amber-600': sessionType() === 'break',
              'text-gray-400': !isActive()
            }">
            <span class="relative flex h-2.5 w-2.5" *ngIf="isActive()">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                [ngClass]="sessionType() === 'work' ? 'bg-blue-400' : 'bg-amber-400'"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5"
                [ngClass]="sessionType() === 'work' ? 'bg-blue-500' : 'bg-amber-500'"></span>
            </span>
            {{ statusText() }}
          </div>
        </div>

        <!-- Controls -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Work Button -->
          <button 
            *ngIf="!isActive() || sessionType() === 'work'"
            (click)="toggleWork()"
            [disabled]="isActive() && sessionType() === 'break'"
            [ngClass]="{
              'col-span-2': sessionType() === 'work' || (!isActive() && sessionType() !== 'break'),
              'opacity-50 cursor-not-allowed': isActive() && sessionType() === 'break'
            }"
            class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 shadow-sm"
            [class]="isActive() && sessionType() === 'work' 
              ? 'bg-red-50 text-red-600 hover:bg-red-100 ring-red-500 border border-red-100' 
              : 'bg-blue-600 text-white hover:bg-blue-700 ring-blue-500'">
            
            <svg *ngIf="!isActive()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
            <svg *ngIf="isActive() && sessionType() === 'work'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            {{ isActive() && sessionType() === 'work' ? 'Stop Work' : 'Start Work' }}
          </button>

          <!-- Break Button -->
          <button 
            *ngIf="!isActive() || sessionType() === 'break'"
            (click)="toggleBreak()"
            [disabled]="isActive() && sessionType() === 'work'"
            [ngClass]="{
              'col-span-2': sessionType() === 'break' || (!isActive() && sessionType() !== 'work'),
              'opacity-50 cursor-not-allowed': isActive() && sessionType() === 'work'
            }"
            class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 shadow-sm"
            [class]="isActive() && sessionType() === 'break'
              ? 'bg-red-50 text-red-600 hover:bg-red-100 ring-red-500 border border-red-100'
              : 'bg-amber-100 text-amber-900 hover:bg-amber-200 ring-amber-500'">
            
            <svg *ngIf="!isActive()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg *ngIf="isActive() && sessionType() === 'break'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            {{ isActive() && sessionType() === 'break' ? 'End Break' : 'Take Break' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class TimerCardComponent implements OnInit, OnDestroy {
  private timeLogService = inject(TimeLogService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  seconds = signal(0);
  isActive = signal(false);
  sessionType = signal<'work' | 'break'>('work');

  private intervalId: any;
  private startTime: Date | null = null;
  private currentOrgId: string | undefined;
  private profileSubscription: Subscription | null = null;

  display = computed(() => this.formatDuration(this.seconds()));

  statusText = computed(() => {
    if (!this.isActive()) return 'Ready to start';
    return this.sessionType() === 'work' ? 'Working...' : 'On Break';
  });

  constructor() {
    effect(() => {
      const user = this.authService.userSignal();

      // Clean up existing subscription
      if (this.profileSubscription) {
        this.profileSubscription.unsubscribe();
        this.profileSubscription = null;
      }

      if (user) {
        this.restoreLocalState(user.uid);

        this.profileSubscription = this.userService.getUserProfileStream(user.uid).subscribe({
          next: (profile) => {
            if (!profile) return;
            this.currentOrgId = profile.orgId;

            // Sync state from profile (source of truth)
            if (profile.isClockedIn && profile.currentSessionStart) {
              const serverStart = profile.currentSessionStart.toDate
                ? profile.currentSessionStart.toDate()
                : new Date(profile.currentSessionStart);

              // Only update if different to avoid jitter or if not currently active
              if (!this.isActive() || !this.startTime || Math.abs(serverStart.getTime() - this.startTime.getTime()) > 1000) {
                this.startTime = serverStart;
                this.isActive.set(true);
                this.sessionType.set(profile.currentSessionType || 'work');
                this.startTicker();
                this.saveLocalState(user.uid);
              }
            } else if (this.isActive()) {
              // Server says not clocked in, but local thinks we are.
              // Force stop to sync with server.
              this.stopTicker();
              this.isActive.set(false);
              this.clearLocalState(user.uid);
            }
          },
          error: (error) => console.error('Error in profile stream:', error)
        });
      }
    });
  }

  ngOnInit() {
    // State restored in effect
  }

  ngOnDestroy() {
    this.stopTicker();
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  async toggleWork() {
    if (this.isActive() && this.sessionType() === 'work') {
      await this.stopSession();
    } else {
      await this.startSession('work');
    }
  }

  async toggleBreak() {
    if (this.isActive() && this.sessionType() === 'break') {
      await this.stopSession();
    } else {
      await this.startSession('break');
    }
  }

  private async startSession(type: 'work' | 'break') {
    const user = this.authService.userSignal();
    if (!user) return;

    this.sessionType.set(type);
    this.isActive.set(true);
    this.startTime = new Date();
    this.seconds.set(0);
    this.startTicker();
    this.saveLocalState(user.uid);

    await this.userService.updateUser(user.uid, {
      isClockedIn: true,
      currentSessionStart: this.startTime,
      currentSessionType: type
    });
  }

  private async stopSession() {
    if (!this.startTime) return;

    const user = this.authService.userSignal();
    if (!user) return;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - this.startTime.getTime()) / 1000);
    const type = this.sessionType();

    // Stop UI first for responsiveness
    this.stopTicker();
    this.isActive.set(false);
    this.clearLocalState(user.uid);
    this.seconds.set(0);

    // 1. Update User Status - Always do this to stop the "clock"
    try {
      await this.userService.updateUser(user.uid, {
        isClockedIn: false,
        currentSessionStart: null,
        currentSessionType: null
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      this.toastService.error('Failed to stop session. Please try again.');
    }

    if (this.currentOrgId) {
      // 2. Save Time Log
      await this.timeLogService.createTimeLog({
        userId: user.uid,
        orgId: this.currentOrgId,
        startTime: this.startTime,
        endTime: endTime,
        duration: duration,
        type: type,
        taskId: ''
      });
    } else {
      console.warn('No organization ID found. Time log was not saved.');
    }
  }

  private startTicker() {
    this.stopTicker();
    if (this.startTime) {
      // Calculate initial seconds
      const now = new Date();
      const diff = Math.floor((now.getTime() - this.startTime.getTime()) / 1000);
      this.seconds.set(diff >= 0 ? diff : 0);
    }

    this.intervalId = setInterval(() => {
      this.seconds.update(s => s + 1);
    }, 1000);
  }

  private stopTicker() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private saveLocalState(userId: string) {
    if (this.startTime) {
      localStorage.setItem(`tracker_startTime_${userId}`, this.startTime.toISOString());
      localStorage.setItem(`tracker_isActive_${userId}`, 'true');
      localStorage.setItem(`tracker_type_${userId}`, this.sessionType());
    }
  }

  private clearLocalState(userId: string) {
    localStorage.removeItem(`tracker_startTime_${userId}`);
    localStorage.removeItem(`tracker_isActive_${userId}`);
    localStorage.removeItem(`tracker_type_${userId}`);
  }

  private restoreLocalState(userId: string) {
    const isActive = localStorage.getItem(`tracker_isActive_${userId}`) === 'true';
    const startTimeStr = localStorage.getItem(`tracker_startTime_${userId}`);
    const type = localStorage.getItem(`tracker_type_${userId}`) as 'work' | 'break';

    if (isActive && startTimeStr) {
      this.startTime = new Date(startTimeStr);
      this.isActive.set(true);
      if (type) this.sessionType.set(type);
      this.startTicker();
    }
  }

  private formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}
