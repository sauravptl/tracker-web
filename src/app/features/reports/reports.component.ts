import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { TimeLogService, TimeLog } from '../../core/services/time-log.service';
import { AuthService } from '../../core/auth/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Analytics & Reports</h1>
          <p class="text-gray-500 mt-1">Insights into your productivity and time usage.</p>
        </div>
        
        <!-- Date Range Filter -->
        <div class="flex items-center space-x-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <button 
            *ngFor="let range of dateRanges"
            (click)="selectRange(range.value)"
            [class]="selectedRange() === range.value 
              ? 'bg-blue-50 text-blue-700 font-medium shadow-sm ring-1 ring-blue-200' 
              : 'text-gray-600 hover:bg-gray-50'"
            class="px-3 py-1.5 rounded-md text-sm transition-all">
            {{ range.label }}
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p class="text-sm font-medium text-gray-500 mb-1">Total Time</p>
          <p class="text-3xl font-bold text-gray-900">{{ formatDuration(totalSeconds()) }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p class="text-sm font-medium text-gray-500 mb-1">Work Sessions</p>
          <p class="text-3xl font-bold text-blue-600">{{ workSessionCount() }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p class="text-sm font-medium text-gray-500 mb-1">Avg. Daily</p>
          <p class="text-3xl font-bold text-emerald-600">{{ formatDuration(avgDailySeconds()) }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p class="text-sm font-medium text-gray-500 mb-1">Productivity Score</p>
          <div class="flex items-end gap-2">
            <p class="text-3xl font-bold text-indigo-600">{{ productivityScore() }}%</p>
            <span class="text-sm text-gray-400 mb-1">vs target</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Activity Chart -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 class="text-lg font-bold text-gray-900 mb-6">Daily Activity</h3>
          <div class="h-80 w-full">
            <canvas baseChart
              [data]="barChartData"
              [options]="barChartOptions"
              [type]="'bar'">
            </canvas>
          </div>
        </div>

        <!-- Session Breakdown -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 class="text-lg font-bold text-gray-900 mb-6">Session Breakdown</h3>
          <div class="h-64 w-full flex items-center justify-center relative">
            <canvas baseChart
              [data]="pieChartData"
              [options]="pieChartOptions"
              [type]="'doughnut'">
            </canvas>
             <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span class="text-3xl font-bold text-gray-900">{{ workPercentage() }}%</span>
              <span class="text-xs text-gray-500 font-medium uppercase tracking-wider">Work</span>
            </div>
          </div>
          <div class="mt-8 space-y-3">
             <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span class="text-gray-600">Work</span>
                </div>
                <span class="font-medium text-gray-900">{{ formatDuration(totalWorkSeconds()) }}</span>
             </div>
             <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span class="text-gray-600">Breaks</span>
                </div>
                <span class="font-medium text-gray-900">{{ formatDuration(totalBreakSeconds()) }}</span>
             </div>
          </div>
        </div>
      </div>

      <!-- Detailed Logs -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900">Detailed Logs</h3>
          <button class="text-sm font-medium text-blue-600 hover:text-blue-700">Export CSV</button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let log of logs()" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {{ log.startTime.toDate() | date:'mediumDate' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ log.startTime.toDate() | date:'shortTime' }} - {{ log.endTime.toDate() | date:'shortTime' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="log.type === 'work' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'">
                    {{ log.type | titlecase }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {{ formatDuration(log.duration) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ log.taskId ? 'Task #' + log.taskId : '-' }}
                </td>
              </tr>
              <tr *ngIf="logs().length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                  No logs found for the selected period.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent {
  private timeLogService = inject(TimeLogService);
  private authService = inject(AuthService);

  dateRanges = [
    { label: 'Last 7 Days', value: '7days' },
    { label: 'Last 30 Days', value: '30days' },
    { label: 'This Month', value: 'month' }
  ];

  selectedRange = signal<string>('7days');
  logs = signal<TimeLog[]>([]);

  // Computed Stats
  totalSeconds = computed(() => this.logs().reduce((acc, log) => acc + log.duration, 0));
  workSessionCount = computed(() => this.logs().filter(l => l.type === 'work').length);

  totalWorkSeconds = computed(() =>
    this.logs().filter(l => l.type === 'work').reduce((acc, l) => acc + l.duration, 0)
  );

  totalBreakSeconds = computed(() =>
    this.logs().filter(l => l.type === 'break').reduce((acc, l) => acc + l.duration, 0)
  );

  avgDailySeconds = computed(() => {
    if (this.logs().length === 0) return 0;
    // Count unique days
    const uniqueDays = new Set(
      this.logs().map(l => {
        const d = l.startTime.toDate ? l.startTime.toDate() : new Date(l.startTime);
        return d.toDateString();
      })
    ).size;
    return uniqueDays > 0 ? this.totalWorkSeconds() / uniqueDays : 0;
  });

  productivityScore = computed(() => {
    // Simple metric: (Work Time / Total Time) * 100
    // Or maybe against a goal of 8 hours? Let's do % of 8h * days
    const uniqueDays = new Set(
      this.logs().map(l => {
        const d = l.startTime.toDate ? l.startTime.toDate() : new Date(l.startTime);
        return d.toDateString();
      })
    ).size;
    if (uniqueDays === 0) return 0;

    const targetSeconds = uniqueDays * 8 * 3600;
    return Math.min(Math.round((this.totalWorkSeconds() / targetSeconds) * 100), 100);
  });

  workPercentage = computed(() => {
    const total = this.totalSeconds();
    if (total === 0) return 0;
    return Math.round((this.totalWorkSeconds() / total) * 100);
  });

  // Charts
  barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f3f4f6' }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } }
    }
  };

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Hours', backgroundColor: '#3b82f6', borderRadius: 4 }]
  };

  pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: { legend: { display: false } }
  };

  pieChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Work', 'Break'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#3b82f6', '#fbbf24'],
      hoverBackgroundColor: ['#2563eb', '#f59e0b'],
      borderWidth: 0
    }]
  };

  constructor() {
    effect(() => {
      this.fetchData();
    });
  }

  selectRange(range: string) {
    this.selectedRange.set(range);
  }

  async fetchData() {
    const user = this.authService.userSignal();
    if (!user) return;

    const range = this.selectedRange();
    let start = new Date();
    let end = new Date();
    end.setHours(23, 59, 59, 999);

    if (range === '7days') {
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (range === '30days') {
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    } else if (range === 'month') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }

    this.timeLogService.getLogsInRange(user.uid, start, end).subscribe(logs => {
      this.logs.set(logs);
      this.updateCharts(logs, start, end);
    });
  }

  updateCharts(logs: TimeLog[], start: Date, end: Date) {
    // 1. Update Pie Chart
    const workSec = logs.filter(l => l.type === 'work').reduce((a, b) => a + b.duration, 0);
    const breakSec = logs.filter(l => l.type === 'break').reduce((a, b) => a + b.duration, 0);

    this.pieChartData = {
      ...this.pieChartData,
      datasets: [{
        ...this.pieChartData.datasets[0],
        data: [workSec / 3600, breakSec / 3600]
      }]
    };

    // 2. Update Bar Chart
    const daysMap = new Map<string, number>();
    const loopDate = new Date(start);
    while (loopDate <= end) {
      daysMap.set(loopDate.toDateString(), 0);
      loopDate.setDate(loopDate.getDate() + 1);
    }

    logs.forEach(log => {
      const d = log.startTime.toDate ? log.startTime.toDate() : new Date(log.startTime);
      const key = d.toDateString();
      if (daysMap.has(key)) {
        daysMap.set(key, (daysMap.get(key) || 0) + log.duration);
      }
    });

    const labels = Array.from(daysMap.keys()).map(d => {
      const date = new Date(d);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const data = Array.from(daysMap.values()).map(sec => Math.round((sec / 3600) * 10) / 10);

    this.barChartData = {
      labels,
      datasets: [{
        data,
        label: 'Hours',
        backgroundColor: '#3b82f6',
        borderRadius: 4,
        barThickness: 20
      }]
    };
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }
}
