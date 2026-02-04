import { Component, signal, computed, OnDestroy, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeLogService, TimeLog } from '../../core/services/time-log.service';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-time-tracker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6 text-gray-900">Time Tracker</h1>
      
      <div class="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100 text-center mb-8 relative overflow-hidden">
        <!-- Decorative background elements -->
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div class="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full opacity-50"></div>
        <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-50 rounded-full opacity-50"></div>

        <div class="relative z-10">
          <div class="text-6xl sm:text-8xl font-mono mb-8 text-gray-800 font-bold tracking-tight">
            {{ display() }}
          </div>
          
          <button 
            (click)="toggle()"
            [class]="isActive() 
              ? 'bg-red-500 hover:bg-red-600 ring-red-200' 
              : 'bg-green-500 hover:bg-green-600 ring-green-200'"
            class="text-white font-bold py-4 px-12 rounded-full text-xl transition-all duration-200 focus:outline-none focus:ring-4 transform active:scale-95 shadow-lg flex items-center justify-center gap-3 mx-auto min-w-[200px]">
            <span *ngIf="!isActive()">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </span>
            <span *ngIf="isActive()">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path></svg>
            </span>
            {{ isActive() ? 'Stop Timer' : 'Start Timer' }}
          </button>
          
          <p class="mt-6 text-gray-500 text-sm font-medium">
            {{ isActive() ? 'Currently tracking time...' : 'Ready to start working?' }}
          </p>
        </div>
      </div>

      <!-- Recent Logs -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div *ngIf="recentLogs().length > 0; else noLogs" class="overflow-x-auto">
          <table class="min-w-full leading-normal">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100">
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Time</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">End Time</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let log of recentLogs()" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {{ log.startTime.toDate() | date:'mediumDate' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span class="bg-blue-100 text-blue-800 py-1 px-2 rounded text-xs font-semibold">
                    {{ formatDuration(log.duration) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ log.startTime.toDate() | date:'shortTime' }}
                </td>
                 <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ log.endTime?.toDate() | date:'shortTime' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noLogs>
          <div class="p-8 text-center text-gray-500">
            <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p>No time logs recorded yet.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class TimeTrackerComponent implements OnInit, OnDestroy {
  private timeLogService = inject(TimeLogService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  seconds = signal(0);
  isActive = signal(false);
  recentLogs = signal<any[]>([]); // Using any[] because of Firestore Timestamp types

  private intervalId: any;
  private startTime: Date | null = null;
  private currentOrgId: string | undefined;

  display = computed(() => {
    const s = this.seconds();
    return this.formatDuration(s);
  });

  constructor() {
    effect(async () => {
      const user = this.authService.userSignal();
      if (user) {
        try {
          const profile = await firstValueFrom(this.userService.getUserProfile(user.uid));
          this.currentOrgId = profile?.orgId;
          this.loadRecentLogs();
        } catch (error) {
          console.error('Error fetching profile in TimeTracker:', error);
        }
      }
    });
  }

  async ngOnInit() {
    this.restoreState(); // Restore timer state first
    // ngOnInit is less critical now due to effect(), but good for init logic not dep on auth signal change
  }

  loadRecentLogs() {
    const user = this.authService.userSignal();
    if (user) {
      this.timeLogService.getRecentLogs(user.uid).subscribe(logs => {
        this.recentLogs.set(logs);
      });
    }
  }

  async toggle() {
    this.isActive.update(v => !v);

    if (this.isActive()) {
      // Start
      this.startTime = new Date();
      this.saveState();
      this.seconds.set(0);
      this.intervalId = setInterval(() => {
        this.seconds.update(s => s + 1);
      }, 1000);

      // Update User Status
      const user = this.authService.userSignal();
      if (user) {
        this.userService.updateUser(user.uid, {
          isClockedIn: true,
          currentSessionStart: this.startTime
        });
      }
    } else {
      // Stop
      clearInterval(this.intervalId);
      this.clearState();
      await this.saveLog();
      this.seconds.set(0);

      // Update User Status
      const user = this.authService.userSignal();
      if (user) {
        this.userService.updateUser(user.uid, {
          isClockedIn: false,
          currentSessionStart: null
        });
      }
    }
  }

  saveState() {
    if (this.startTime) {
      localStorage.setItem('tracker_startTime', this.startTime.toISOString());
      localStorage.setItem('tracker_isActive', 'true');
    }
  }

  clearState() {
    localStorage.removeItem('tracker_startTime');
    localStorage.removeItem('tracker_isActive');
  }

  restoreState() {
    const isActive = localStorage.getItem('tracker_isActive') === 'true';
    const startTimeStr = localStorage.getItem('tracker_startTime');

    if (isActive && startTimeStr) {
      this.startTime = new Date(startTimeStr);
      this.isActive.set(true);

      // Calculate seconds elapsed
      const now = new Date();
      const diffSeconds = Math.round((now.getTime() - this.startTime.getTime()) / 1000);
      this.seconds.set(diffSeconds);

      // Resume interval
      this.intervalId = setInterval(() => {
        this.seconds.update(s => s + 1);
      }, 1000);
    }
  }

  async saveLog() {
    if (!this.startTime || !this.currentOrgId) return;

    const user = this.authService.userSignal();
    if (!user) return;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - this.startTime.getTime()) / 1000);

    try {
      await this.timeLogService.createTimeLog({
        userId: user.uid,
        orgId: this.currentOrgId,
        startTime: this.startTime,
        endTime: endTime,
        duration: duration,
        taskId: '' // Optional for now
      });
      // Recent logs will auto-update due to observable subscription if we kept it live, 
      // but here we might need to refresh if not using real-time listener correctly or if strict on reads.
      // The service uses collectionData which is real-time.
    } catch (error) {
      console.error('Error saving time log:', error);
    }
  }

  formatDuration(seconds: number): string {
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
