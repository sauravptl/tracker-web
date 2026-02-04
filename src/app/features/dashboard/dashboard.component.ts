import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AuthService } from '../../core/auth/auth.service';
import { TaskService } from '../../core/services/task.service';
import { TimeLogService } from '../../core/services/time-log.service';
import { UserService } from '../../core/services/user.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="p-4 sm:p-6 space-y-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <!-- My Tasks -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-700">My Tasks</h3>
            <span class="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <p class="text-3xl font-bold text-gray-900">{{ myTasksCount() }}</p>
            <span class="text-sm text-gray-500">Total</span>
          </div>
          <p class="text-sm text-blue-600 mt-2 font-medium">{{ myTodoCount() }} Pending Tasks</p>
        </div>

        <!-- Hours Today -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-700">Hours Today</h3>
            <span class="p-2 bg-green-50 text-green-600 rounded-lg">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <p class="text-3xl font-bold text-gray-900">{{ todayDurationDisplay() }}</p>
          </div>
          <p class="text-sm text-gray-500 mt-2">Target: <span class="font-medium text-gray-700">8h 00m</span></p>
        </div>

        <!-- Team Status -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-700">Team Status</h3>
            <span class="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <p class="text-3xl font-bold text-gray-900">{{ activeTeamMembers() }}</p>
            <span class="text-sm text-gray-500">Active</span>
          </div>
          <p class="text-sm text-indigo-600 mt-2 font-medium">Online Now</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Weekly Activity Chart -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 class="text-lg font-semibold mb-6 text-gray-800">Weekly Activity</h3>
          <div class="h-72 w-full">
            <canvas baseChart
              [data]="barChartData"
              [options]="barChartOptions"
              [type]="'bar'">
            </canvas>
          </div>
        </div>

        <!-- Active Users List (For Managers/Admins) -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-semibold mb-4 text-gray-800">Who's Working</h3>
          <div *ngIf="activeTeamMembers() > 0; else noActive" class="space-y-3">
            <div *ngFor="let user of activeUsers()" class="flex items-center space-x-3 bg-green-50/50 p-3 rounded-xl border border-green-100 transition-colors hover:bg-green-50">
              <div class="relative">
                <div class="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-sm">
                  {{ (user.displayName || user.email || '?').substring(0, 2).toUpperCase() }}
                </div>
                <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div class="flex-1 min-w-0">
                <span class="block text-sm font-medium text-gray-900 truncate">{{ user.displayName || user.email }}</span>
                <span *ngIf="user.currentSessionStart" class="text-xs text-gray-500">
                  Clocked in at {{ user.currentSessionStart.toDate() | date:'shortTime' }}
                </span>
              </div>
            </div>
          </div>
          <ng-template #noActive>
            <div class="text-center py-8">
              <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
              </div>
              <p class="text-gray-500 text-sm italic">No one is currently clocked in.</p>
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

  // Chart Data
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Hours' }
      }
    }
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Hours', backgroundColor: '#3b82f6', borderRadius: 4 }
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
      // Only add if it's within our map (should be per query, but safe check)
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
          borderRadius: 4
        }
      ]
    };
  }
}
