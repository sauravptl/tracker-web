import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { LeaveRequest, LeaveRequestService, LeaveStatus } from '../../core/services/leave-request.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-leave-approval',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 sm:p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold mb-6 text-gray-900">Leave Approvals</h1>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-yellow-400">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-500 text-sm font-medium">Pending Requests</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">{{ pendingCount() }}</p>
            </div>
            <div class="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-green-500">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-500 text-sm font-medium">Approved (Month)</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">{{ approvedCount() }}</p>
            </div>
            <div class="p-2 bg-green-50 rounded-lg text-green-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-red-500">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-500 text-sm font-medium">Rejected (Month)</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">{{ rejectedCount() }}</p>
            </div>
            <div class="p-2 bg-red-50 rounded-lg text-red-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Requests List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900">Pending Requests</h2>
          <span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{{ pendingRequests().length }} waiting</span>
        </div>
        
        <div *ngIf="pendingRequests().length > 0; else noRequests" class="overflow-x-auto">
          <table class="min-w-full leading-normal">
            <thead class="bg-gray-50 border-b border-gray-100 hidden sm:table-header-group">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let req of pendingRequests()" class="hover:bg-gray-50/50 transition-colors flex flex-col sm:table-row p-4 sm:p-0 mb-4 sm:mb-0 border sm:border-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none bg-white">
                <td class="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-900 sm:table-cell flex justify-between items-center">
                  <span class="sm:hidden font-semibold text-gray-500">Employee:</span>
                  <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                      U
                    </div>
                    <span class="font-medium">{{ req.userId }}</span>
                  </div>
                </td>
                <td class="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-900 sm:table-cell flex justify-between items-center">
                  <span class="sm:hidden font-semibold text-gray-500">Type:</span>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    {{ req.type }}
                  </span>
                </td>
                <td class="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-900 sm:table-cell flex justify-between items-center">
                  <span class="sm:hidden font-semibold text-gray-500">Dates:</span>
                  <div>
                    {{ req.startDate.toDate() | date:'shortDate' }} - {{ req.endDate.toDate() | date:'shortDate' }}
                    <span class="text-xs text-gray-500 ml-1">({{ getDurationDays(req.startDate, req.endDate) }} days)</span>
                  </div>
                </td>
                <td class="px-4 sm:px-6 py-2 sm:py-4 text-sm text-gray-500 sm:table-cell sm:max-w-xs truncate">
                  <div class="flex flex-col sm:block">
                    <span class="sm:hidden font-semibold text-gray-500 mb-1">Reason:</span>
                    <span [title]="req.reason">{{ req.reason }}</span>
                  </div>
                </td>
                <td class="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-right sm:table-cell flex justify-end gap-2 mt-2 sm:mt-0">
                  <button 
                    (click)="updateStatus(req, 'APPROVED')" 
                    class="bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-green-200">
                    Approve
                  </button>
                  <button 
                    (click)="updateStatus(req, 'REJECTED')" 
                    class="bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-red-200">
                    Reject
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noRequests>
          <div class="p-12 text-center text-gray-500">
            <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p class="text-lg font-medium text-gray-900">All caught up!</p>
            <p>No pending leave requests at the moment.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class LeaveApprovalComponent {
  private leaveService = inject(LeaveRequestService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  allRequests = signal<LeaveRequest[]>([]);

  // Computed signals for filtering
  pendingRequests = signal<LeaveRequest[]>([]);
  pendingCount = signal(0);
  approvedCount = signal(0);
  rejectedCount = signal(0);

  currentOrgId: string | undefined;

  constructor() {
    effect(() => {
      const user = this.authService.userSignal();
      if (user) {
        this.userService.getUserProfileStream(user.uid).subscribe(profile => {
          if (profile?.role === 'admin' || profile?.role === 'manager') {
            this.currentOrgId = profile?.orgId;
            if (this.currentOrgId) {
              this.loadRequests();
            }
          }
        });
      }
    });
  }

  loadRequests() {
    if (!this.currentOrgId) return;

    this.leaveService.getOrgRequests(this.currentOrgId).subscribe(requests => {
      this.allRequests.set(requests);

      // Update derived signals
      this.pendingRequests.set(requests.filter(r => r.status === 'PENDING'));
      this.pendingCount.set(this.pendingRequests().length);
      this.approvedCount.set(requests.filter(r => r.status === 'APPROVED').length);
      this.rejectedCount.set(requests.filter(r => r.status === 'REJECTED').length);
    });
  }

  async updateStatus(request: LeaveRequest, status: LeaveStatus) {
    if (!request.id) return;

    try {
      await this.leaveService.updateStatus(request.id, status);
      // The observable will auto-update the UI
      this.toastService.success(`Request ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      this.toastService.error('Failed to update request status');
    }
  }

  getDurationDays(start: any, end: any): number {
    const s = start.toDate();
    const e = end.toDate();
    const diffTime = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
  }
}
