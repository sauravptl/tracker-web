import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AuthService } from '../../core/auth/auth.service';
import { TaskService } from '../../core/services/task.service';
import { TimeLogService } from '../../core/services/time-log.service';
import { UserService } from '../../core/services/user.service';
import { firstValueFrom } from 'rxjs';
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
               <div class="bg-emerald-500 h-2 rounded-full transition-all duration-1000" [style.width.%]="(todayDurationSeconds() / (8 * 3600)) * 100"></div>
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
            <span class="text-sm text-gray-500 font-medium">Active</span>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <span class="relative flex h-3 w-3 mr-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
            <span class="text-indigo-600 font-medium">Online Now</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8" @staggerFadeIn>
        <!-- Weekly Activity Chart -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 transition-shadow hover:shadow-md">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Weekly Activity</h3>
            <button class="text-sm text-blue-600 hover:text-blue-700 font-medium">View Report</button>
          </div>
          <div class="h-80 w-full">
            <canvas baseChart
              [data]="barChartData"
              [options]="barChartOptions"
              [type]="'bar'">
            </canvas>
          </div>
        </div>

        <!-- Active Users List (For Managers/Admins) -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full transition-shadow hover:shadow-md">
          <h3 class="text-xl font-bold mb-6 text-gray-900">Who's Working</h3>
          <div *ngIf="activeTeamMembers() > 0; else noActive" class="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            <div *ngFor="let user of activeUsers()" class="group flex items-center space-x-4 p-3 rounded-xl transition-all hover:bg-gray-50 border border-transparent hover:border-gray-200">
              <div class="relative">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-green-700 font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                  {{ (user.displayName || user.email || '?').substring(0, 2).toUpperCase() }}
                </div>
                <div class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div class="flex-1 min-w-0">
                <span class="block text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{{ user.displayName || user.email }}</span>
                <span *ngIf="user.currentSessionStart" class="text-xs text-gray-500 flex items-center mt-0.5">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Clocked in {{ user.currentSessionStart.toDate() | date:'shortTime' }}
                </span>
              </div>
            </div>
          </div>
          <ng-template #noActive>
            <div class="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 text-gray-300">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
              </div>
              <p class="text-gray-500 font-medium">No active sessions</p>
              <p class="text-gray-400 text-sm mt-1">Team members will appear here when they clock in.</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private taskService = inject(TaskService);
  private timeLogService = inject(TimeLogService);
  private userService = inject(UserService);

  myTasksCount = signal(0);
  myTodoCount = signal(0);
  todayDurationSeconds = signal(0);
  activeTeamMembers = signal(0);
  activeUsers = signal<any[]>([]);
  currentDate = new Date();

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

  todayDurationDisplay = computed(() => {
    const totalSeconds = this.todayDurationSeconds();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
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

        // 2. Fetch Today's Time Logs Stats
        this.timeLogService.getTodayLogs(user.uid).subscribe(logs => {
          const total = logs.reduce((acc, log) => acc + log.duration, 0);
          this.todayDurationSeconds.set(total);
        });

        // 3. Fetch Week's Logs for Chart
        this.timeLogService.getWeekLogs(user.uid).subscribe(logs => {
          this.processChartData(logs);
        });

        // 4. Fetch Team Status
        try {
          const profile = await firstValueFrom(this.userService.getUserProfile(user.uid));
          if (profile?.orgId) {
            this.userService.getOrgUsers(profile.orgId).subscribe(users => {
              const active = users.filter(u => u.isClockedIn);
              this.activeTeamMembers.set(active.length);
              this.activeUsers.set(active);
            });
          }
        } catch (error) {
          console.error('Error fetching user profile for dashboard:', error);
        }
      }
    });
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
      const d = log.startTime.toDate();
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
