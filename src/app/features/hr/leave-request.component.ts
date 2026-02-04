import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { LeaveRequest, LeaveRequestService, LeaveType } from '../../core/services/leave-request.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-4 sm:p-6 max-w-6xl mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Leave Requests</h1>
          <p class="text-sm text-gray-500 mt-1">Manage your time off.</p>
        </div>
        <button (click)="showRequestModal = true" class="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2">
          <span>+</span> New Request
        </button>
      </div>

      <!-- New Request Modal -->
      <div *ngIf="showRequestModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all">
          <h2 class="text-xl font-bold mb-6 text-gray-900">Submit Leave Request</h2>
          <form [formGroup]="leaveForm" (ngSubmit)="submitRequest()">
            <div class="mb-5">
              <label class="block text-gray-700 text-sm font-semibold mb-2">Leave Type</label>
              <select formControlName="type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                <option value="VACATION">Vacation</option>
                <option value="SICK">Sick Leave</option>
                <option value="PERSONAL">Personal</option>
              </select>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label class="block text-gray-700 text-sm font-semibold mb-2">Start Date</label>
                <input 
                  type="date" 
                  formControlName="startDate" 
                  [class.border-red-500]="leaveForm.get('startDate')?.invalid && leaveForm.get('startDate')?.touched"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                <div *ngIf="leaveForm.get('startDate')?.invalid && leaveForm.get('startDate')?.touched" class="text-red-500 text-xs mt-1">
                  Required.
                </div>
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-semibold mb-2">End Date</label>
                <input 
                  type="date" 
                  formControlName="endDate" 
                  [class.border-red-500]="leaveForm.get('endDate')?.invalid && leaveForm.get('endDate')?.touched"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                <div *ngIf="leaveForm.get('endDate')?.invalid && leaveForm.get('endDate')?.touched" class="text-red-500 text-xs mt-1">
                  Required.
                </div>
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-gray-700 text-sm font-semibold mb-2">Reason</label>
              <textarea 
                formControlName="reason" 
                rows="3" 
                [class.border-red-500]="leaveForm.get('reason')?.invalid && leaveForm.get('reason')?.touched"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                placeholder="Briefly describe why..."></textarea>
              <div *ngIf="leaveForm.get('reason')?.invalid && leaveForm.get('reason')?.touched" class="text-red-500 text-xs mt-1">
                Reason is required.
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <button type="button" (click)="showRequestModal = false" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" [disabled]="leaveForm.invalid || isSubmitting" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Requests List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 hidden sm:block">
          <h3 class="text-lg font-semibold text-gray-900">Your History</h3>
        </div>
        
        <div *ngIf="myRequests().length > 0; else noRequests" class="overflow-x-auto">
          <table class="min-w-full leading-normal">
            <thead class="bg-gray-50 border-b border-gray-100 hidden sm:table-header-group">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let req of myRequests()" class="hover:bg-gray-50/50 transition-colors flex flex-col sm:table-row p-4 sm:p-0 mb-4 sm:mb-0 border sm:border-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none bg-white">
                <td class="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-900 sm:table-cell flex justify-between items-center">
                  <span class="sm:hidden font-semibold text-gray-500">Type:</span>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    {{ req.type }}
                  </span>
                </td>
                <td class="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-900 sm:table-cell flex justify-between items-center">
                  <span class="sm:hidden font-semibold text-gray-500">Dates:</span>
                  <span>{{ req.startDate.toDate() | date:'shortDate' }} - {{ req.endDate.toDate() | date:'shortDate' }}</span>
                </td>
                <td class="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm sm:table-cell flex justify-between items-center">
                  <span class="sm:hidden font-semibold text-gray-500">Status:</span>
                  <span [class]="getStatusClass(req.status)" class="px-2.5 py-0.5 rounded-full text-xs font-medium border">
                    {{ req.status }}
                  </span>
                </td>
                <td class="px-4 sm:px-6 py-2 sm:py-4 text-sm text-gray-500 sm:table-cell sm:max-w-xs truncate">
                  <div class="flex flex-col sm:block">
                    <span class="sm:hidden font-semibold text-gray-500 mb-1">Reason:</span>
                    <span [title]="req.reason">{{ req.reason }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noRequests>
          <div class="p-8 text-center text-gray-500">
            <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <p>No leave requests found.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class LeaveRequestComponent implements OnInit {
  private leaveService = inject(LeaveRequestService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  myRequests = signal<LeaveRequest[]>([]);
  showRequestModal = false;
  isSubmitting = false;
  currentOrgId: string | undefined;

  leaveForm = this.fb.group({
    type: ['VACATION', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    reason: ['', Validators.required]
  });

  async ngOnInit() {
    const user = this.authService.userSignal();
    if (user) {
      const profile = await firstValueFrom(this.userService.getUserProfile(user.uid));
      this.currentOrgId = profile?.orgId;

      this.leaveService.getMyRequests(user.uid).subscribe(requests => {
        this.myRequests.set(requests);
      });
    }
  }

  async submitRequest() {
    if (this.leaveForm.valid && this.currentOrgId) {
      this.isSubmitting = true;
      const { type, startDate, endDate, reason } = this.leaveForm.value;
      const user = this.authService.userSignal();

      try {
        await this.leaveService.createLeaveRequest({
          userId: user!.uid,
          orgId: this.currentOrgId,
          type: type as LeaveType,
          startDate: new Date(startDate!),
          endDate: new Date(endDate!),
          reason: reason!,
          status: 'PENDING',
          createdAt: new Date()
        });

        this.showRequestModal = false;
        this.leaveForm.reset({ type: 'VACATION' });
      } catch (error) {
        console.error('Error submitting leave request:', error);
        alert('Failed to submit request');
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  }
}
