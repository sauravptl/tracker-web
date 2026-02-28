import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeLogService } from '../../core/services/time-log.service';
import { AuthService } from '../../core/auth/auth.service';
import { TimerCardComponent } from '../dashboard/components/timer-card/timer-card.component';

@Component({
  selector: 'app-time-tracker',
  standalone: true,
  imports: [CommonModule, TimerCardComponent],
  template: `
    <div class="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6 text-gray-900">Time Tracker</h1>
      
      <div class="mb-8">
        <app-timer-card></app-timer-card>
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
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
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
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span [class]="log.type === 'break' 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-blue-100 text-blue-800'"
                    class="py-1 px-2 rounded text-xs font-semibold capitalize">
                    {{ log.type || 'work' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span class="bg-gray-100 text-gray-800 py-1 px-2 rounded text-xs font-semibold">
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
export class TimeTrackerComponent implements OnInit {
  private timeLogService = inject(TimeLogService);
  private authService = inject(AuthService);

  recentLogs = signal<any[]>([]);

  ngOnInit() {
    this.loadRecentLogs();
  }

  loadRecentLogs() {
    const user = this.authService.userSignal();
    if (user) {
      this.timeLogService.getRecentLogs(user.uid).subscribe(logs => {
        this.recentLogs.set(logs);
      });
    }
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}
