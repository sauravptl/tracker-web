import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AuthService } from '../../core/auth/auth.service';
import { TaskService } from '../../core/services/task.service';
import { TimeLogService } from '../../core/services/time-log.service';
import { UserService, UserProfile } from '../../core/services/user.service';
import { LeaveRequestService, LeaveRequest } from '../../core/services/leave-request.service';
import { firstValueFrom, Subscription, interval } from 'rxjs';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { TimerCardComponent } from './components/timer-card/timer-card.component';

const fadeInAnimation = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(10px)' }),
    animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

const staggerFadeIn = trigger('staggerFadeIn', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(10px)' }),
      stagger('100ms', [
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, TimerCardComponent],
  animations: [fadeInAnimation, staggerFadeIn],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-8" @fadeIn>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p class="text-gray-500 mt-1">Welcome back, let's make today productive.</p>
        </div>
        <div class="hidden sm:block text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          {{ currentDate | date:'fullDate' }}
        </div>
      </div>

      <app-timer-card></app-timer-card>
      
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6" @staggerFadeIn>
        <!-- My Tasks -->
        <div class="bg-gradient-to-br from-white to-blue-50/50 p-6 rounded-2xl shadow-sm border border-blue-100/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">My Tasks</h3>
            <span class="p-3 bg-white text-blue-600 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <p class="text-4xl font-bold text-gray-900 tracking-tight">{{ myTasksCount() }}</p>
            <span class="text-sm text-gray-500 font-medium">Total</span>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <span class="flex items-center text-blue-600 font-medium bg-blue-100/50 px-2 py-1 rounded-md">
              {{ myTodoCount() }} Pending
            </span>
          </div>
        </div>

        <!-- Hours Today -->
        <div class="bg-gradient-to-br from-white to-emerald-50/50 p-6 rounded-2xl shadow-sm border border-emerald-100/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-700 group-hover:text-emerald-700 transition-colors">Hours Today</h3>
            <span class="p-3 bg-white text-emerald-600 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <p class="text-4xl font-bold text-gray-900 tracking-tight">{{ todayDurationDisplay() }}</p>
          </div>
          <div class="mt-4 flex items-center justify-between text-sm">
            <div class="w-full bg-gray-100 rounded-full h-2 mr-3 overflow-hidden">
               <div class="bg-emerald-500 h-2 rounded-full transition-all duration-1000" [style.width.%]="(totalTodaySeconds() / (8 * 3600)) * 100"></div>
            </div>
            <span class="text-gray-500 whitespace-nowrap">Goal: 8h</span>
          </div>
        </div>

        <!-- Team Status -->
        <div class="bg-gradient-to-br from-white to-indigo-50/50 p-6 rounded-2xl shadow-sm border border-indigo-100/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-700 group-hover:text-indigo-700 transition-colors">Team Status</h3>
            <span class="p-3 bg-white text-indigo-600 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <p class="text-4xl font-bold text-gray-900 tracking-tight">{{ activeTeamMembers() }}</p>
            <span class="text-sm text-gray-500 font-medium">Working</span>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <span class="relative flex h-3 w-3 mr-2" *ngIf="activeTeamMembers() > 0">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
            <span class="text-indigo-600 font-medium">{{ activeTeamMembers() }} Online Now</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8" @staggerFadeIn>
        <!-- Weekly Activity Chart -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 transition-shadow hover:shadow-md flex flex-col">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Weekly Activity</h3>
            <!-- <button class="text-sm text-blue-600 hover:text-blue-700 font-medium">View Report</button> -->
          </div>
          <div class="h-64 w-full mb-6">
            <canvas baseChart
              [data]="barChartData"
              [options]="barChartOptions"
              [type]="'bar'">
            </canvas>
          </div>

          <!-- Recent Activity Section -->
           <div class="border-t border-gray-100 pt-6">
            <h4 class="text-lg font-bold text-gray-900 mb-4">Recent Activity</h4>
            <div class="space-y-4">
              <div *ngFor="let log of recentLogs()" class="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center"
                    [ngClass]="log.type === 'work' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'">
                    <svg *ngIf="log.type === 'work'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <svg *ngIf="log.type === 'break'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ log.type === 'work' ? 'Work Session' : 'Break' }}</p>
                    <p class="text-xs text-gray-500">{{ log.startTime.toDate() | date:'mediumDate' }} • {{ log.startTime.toDate() | date:'shortTime' }} - {{ log.endTime.toDate() | date:'shortTime' }}</p>
                  </div>
                </div>
                <div class="font-mono font-medium text-gray-700">
                  {{ formatDuration(log.duration) }}
                </div>
              </div>
              <div *ngIf="recentLogs().length === 0" class="text-center text-gray-500 py-4">
                No recent activity found.
              </div>
            </div>
           </div>
        </div>

        <!-- Team Status List -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full transition-shadow hover:shadow-md">
          <h3 class="text-xl font-bold mb-6 text-gray-900">Team Status</h3>
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
            <div *ngFor="let user of teamUsersWithStatus()" class="group flex items-center space-x-4 p-3 rounded-xl transition-all hover:bg-gray-50 border border-transparent hover:border-gray-200">
              <div class="relative">
                <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform"
                  [ngClass]="{
                    'bg-green-500': user.status === 'Working',
                    'bg-amber-500': user.status === 'On Break',
                    'bg-red-500': user.status === 'On Leave',
                    'bg-gray-400': user.status === 'Offline'
                  }">
                  {{ (user.displayName || user.email || '?').substring(0, 2).toUpperCase() }}
                </div>
                <div class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white"
                  [ngClass]="{
                    'bg-green-500': user.status === 'Working',
                    'bg-amber-500': user.status === 'On Break',
                    'bg-red-500': user.status === 'On Leave',
                    'bg-gray-400': user.status === 'Offline'
                  }"></div>
              </div>
              <div class="flex-1 min-w-0">
                <span class="block text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{{ user.displayName || user.email }}</span>
                
                <!-- Status Badge -->
                <div class="mt-1 flex items-center">
                   <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    [ngClass]="{
                      'bg-green-100 text-green-800': user.status === 'Working',
                      'bg-amber-100 text-amber-800': user.status === 'On Break',
                      'bg-red-100 text-red-800': user.status === 'On Leave',
                      'bg-gray-100 text-gray-800': user.status === 'Offline'
                    }">
                    {{ user.status }}
                   </span>
                   <span *ngIf="user.status === 'Working' && user.currentSessionStart" class="text-xs text-gray-400 ml-2">
                     Since {{ user.currentSessionStart.toDate() | date:'shortTime' }}
                   </span>
                </div>
              </div>
            </div>
            
            <div *ngIf="teamUsersWithStatus().length === 0" class="text-center py-8 text-gray-500">
              No team members found.
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnDestroy {
  private authService = inject(AuthService);
  private taskService = inject(TaskService);
  private timeLogService = inject(TimeLogService);
  private userService = inject(UserService);
  private leaveService = inject(LeaveRequestService);

  myTasksCount = signal(0);
  myTodoCount = signal(0);
  todayLogsDuration = signal(0);
  currentSessionDuration = signal(0);

  recentLogs = signal<any[]>([]);
  activeTeamMembers = signal(0);

  // All team users with computed status
  teamUsersWithStatus = signal<any[]>([]);

  currentDate = new Date();
  private timerSubscription: Subscription | null = null;
  private currentSessionStart: Date | null = null;

  // Chart Data
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, family: 'Inter' },
        bodyFont: { size: 13, family: 'Inter' },
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        border: { display: false },
        ticks: { font: { family: 'Inter' }, color: '#6b7280' }
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { family: 'Inter' }, color: '#6b7280' }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Hours',
        backgroundColor: '#3b82f6',
        hoverBackgroundColor: '#2563eb',
        borderRadius: 6,
        barThickness: 32
      }
    ]
  };

  totalTodaySeconds = computed(() => this.todayLogsDuration() + this.currentSessionDuration());

  todayDurationDisplay = computed(() => {
    const totalSeconds = this.totalTodaySeconds();
    return this.formatDuration(totalSeconds);
  });

  constructor() {
    effect(async () => {
      const user = this.authService.userSignal();
      if (user) {
        // 1. Fetch My Tasks Stats
        this.taskService.getMyTasks(user.uid).subscribe(tasks => {
          this.myTasksCount.set(tasks.length);
          this.myTodoCount.set(tasks.filter(t => t.status !== 'DONE').length);
        });

        // 2. Fetch Today's Time Logs Stats (Completed Logs)
        this.timeLogService.getTodayLogs(user.uid).subscribe(logs => {
          const total = logs.reduce((acc, log) => acc + log.duration, 0);
          this.todayLogsDuration.set(total);
        });

        // 3. Fetch Recent Logs
        this.timeLogService.getRecentLogs(user.uid, 5).subscribe(logs => {
          this.recentLogs.set(logs);
        });

        // 4. Fetch Week's Logs for Chart
        this.timeLogService.getWeekLogs(user.uid).subscribe(logs => {
          this.processChartData(logs);
        });

        // 5. Fetch User Profile to get Current Session (for Live Hours Today)
        this.userService.getUserProfileStream(user.uid).subscribe(profile => {
          if (profile?.isClockedIn && profile.currentSessionStart) {
            this.currentSessionStart = profile.currentSessionStart.toDate
              ? profile.currentSessionStart.toDate()
              : new Date(profile.currentSessionStart);

            // Start local timer to update dashboard view
            this.startDashboardTimer();
          } else {
            this.currentSessionStart = null;
            this.currentSessionDuration.set(0);
            this.stopDashboardTimer();
          }
        });

        // 6. Fetch Team Status & Who's Working
        try {
          const profile = await firstValueFrom(this.userService.getUserProfile(user.uid));
          if (profile?.orgId) {
            // Combine Users + Leaves
            const users$ = this.userService.getOrgUsers(profile.orgId);
            const leaves$ = this.leaveService.getOrgRequests(profile.orgId);

            // Using simple subscription for now, could use forkJoin or combineLatest if strict sync needed
            users$.subscribe(async (users) => {
              // We need leaves to determine status
              const leaves = await firstValueFrom(leaves$); // Get current snapshot of leaves

              const usersWithStatus = users.map(u => {
                let status = 'Offline';
                if (u.isClockedIn) {
                  status = u.currentSessionType === 'break' ? 'On Break' : 'Working';
                } else {
                  // Check if on active leave
                  const activeLeave = leaves.find(l =>
                    l.userId === u.uid &&
                    l.status === 'APPROVED' &&
                    this.isDateInRange(new Date(), l.startDate, l.endDate)
                  );
                  if (activeLeave) {
                    status = 'On Leave';
                  }
                }
                return { ...u, status };
              });

              // Sort: Working > Break > Leave > Offline
              usersWithStatus.sort((a, b) => {
                const score = (status: string) => {
                  if (status === 'Working') return 3;
                  if (status === 'On Break') return 2;
                  if (status === 'On Leave') return 1;
                  return 0;
                };
                return score(b.status) - score(a.status);
              });

              this.teamUsersWithStatus.set(usersWithStatus);
              this.activeTeamMembers.set(usersWithStatus.filter(u => u.status === 'Working' || u.status === 'On Break').length);
            });
          }
        } catch (error) {
          console.error('Error fetching data for dashboard:', error);
        }
      }
    });
  }

  ngOnDestroy() {
    this.stopDashboardTimer();
  }

  private startDashboardTimer() {
    this.stopDashboardTimer();
    this.updateCurrentSessionDuration(); // Initial call
    this.timerSubscription = interval(60000).subscribe(() => { // Update every minute
      this.updateCurrentSessionDuration();
    });
  }

  private stopDashboardTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  private updateCurrentSessionDuration() {
    if (this.currentSessionStart) {
      const now = new Date();
      const diff = Math.floor((now.getTime() - this.currentSessionStart.getTime()) / 1000);
      this.currentSessionDuration.set(diff > 0 ? diff : 0);
    }
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    // const s = seconds % 60; // Don't show seconds for general activity
    return `${h}h ${m}m`;
  }

  private isDateInRange(date: Date, start: any, end: any): boolean {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const s = start.toDate ? start.toDate() : new Date(start);
    s.setHours(0, 0, 0, 0);

    const e = end.toDate ? end.toDate() : new Date(end);
    e.setHours(23, 59, 59, 999);

    return d >= s && d <= e;
  }

  processChartData(logs: any[]) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dataMap = new Map<string, number>();

    // Initialize last 7 days
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayLabel = days[d.getDay()];
      dataMap.set(dayLabel, 0); // Init with 0
    }

    // Aggregate logs
    logs.forEach(log => {
      const d = log.startTime.toDate ? log.startTime.toDate() : new Date(log.startTime);
      const dayLabel = days[d.getDay()];
      if (dataMap.has(dayLabel)) {
        dataMap.set(dayLabel, (dataMap.get(dayLabel) || 0) + (log.duration / 3600));
      }
    });

    // Update chart
    this.barChartData = {
      labels: Array.from(dataMap.keys()),
      datasets: [
        {
          data: Array.from(dataMap.values()).map(v => Math.round(v * 10) / 10),
          label: 'Hours',
          backgroundColor: '#3b82f6',
          hoverBackgroundColor: '#2563eb',
          borderRadius: 6,
          barThickness: 32
        }
      ]
    };
  }
}
