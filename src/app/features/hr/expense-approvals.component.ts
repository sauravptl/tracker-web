import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { ExpenseClaim, ExpenseService, ExpenseStatus } from '../../core/services/expense.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-expense-approvals',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 sm:p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold mb-6 text-gray-900">Expense Approvals</h1>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-yellow-400">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-500 text-sm font-medium">Pending Claims</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">{{ pendingCount() }}</p>
            </div>
            <div class="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-blue-500">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-500 text-sm font-medium">Pending Amount</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">{{ pendingAmount() | currency:'USD':'symbol':'1.0-0' }}</p>
              <p class="text-xs text-gray-400 mt-1">* Approx in USD</p>
            </div>
            <div class="p-2 bg-blue-50 rounded-lg text-blue-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Requests List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900">Pending Claims</h2>
          <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{{ pendingClaims().length }} waiting</span>
        </div>
        
        <div *ngIf="pendingClaims().length > 0; else noClaims" class="overflow-x-auto">
          <table class="min-w-full leading-normal">
            <thead class="bg-gray-50 border-b border-gray-100 hidden sm:table-header-group">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let claim of pendingClaims()" class="hover:bg-gray-50/50 transition-colors flex flex-col sm:table-row p-4 sm:p-0 mb-4 sm:mb-0 border sm:border-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none bg-white">
                <td class="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-900 sm:table-cell flex justify-between items-center">
                  <span class="sm:hidden font-semibold text-gray-500">Employee:</span>
                  <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-3">
                      U
                    </div>
                    <span class="font-medium">{{ claim.userId }}</span>
                  </div>
                </td>
                <td class="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-900 sm:table-cell flex justify-between items-center">
                  <span class="sm:hidden font-semibold text-gray-500">Date:</span>
                  <span>{{ claim.date.toDate() | date:'shortDate' }}</span>
                </td>
                <td class="px-4 sm:px-6 py-2 sm:py-4 text-sm text-gray-500 sm:table-cell sm:max-w-xs truncate">
                  <div class="flex flex-col sm:block">
                    <span class="sm:hidden font-semibold text-gray-500 mb-1">Description:</span>
                    <span>{{ claim.description }}</span>
                  </div>
                </td>
                <td class="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900 sm:table-cell flex justify-between items-center">
                  <span class="sm:hidden font-semibold text-gray-500">Amount:</span>
                  <span class="font-mono text-blue-600">{{ claim.amount | currency:claim.currency }}</span>
                </td>
                <td class="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-right sm:table-cell flex justify-end gap-2 mt-2 sm:mt-0">
                  <button 
                    (click)="updateStatus(claim, 'APPROVED')" 
                    class="bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-green-200">
                    Approve
                  </button>
                  <button 
                    (click)="updateStatus(claim, 'REJECTED')" 
                    class="bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-red-200">
                    Reject
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noClaims>
          <div class="p-12 text-center text-gray-500">
            <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p class="text-lg font-medium text-gray-900">All caught up!</p>
            <p>No pending expense claims at the moment.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class ExpenseApprovalsComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  allClaims = signal<ExpenseClaim[]>([]);

  pendingClaims = signal<ExpenseClaim[]>([]);
  pendingCount = signal(0);
  pendingAmount = signal(0);

  currentOrgId: string | undefined;

  async ngOnInit() {
    const user = this.authService.userSignal();
    if (user) {
      const profile = await firstValueFrom(this.userService.getUserProfile(user.uid));
      if (profile?.role === 'admin' || profile?.role === 'manager') {
        this.currentOrgId = profile?.orgId;
        if (this.currentOrgId) {
          this.loadClaims();
        }
      }
    }
  }

  loadClaims() {
    if (!this.currentOrgId) return;

    this.expenseService.getOrgExpenses(this.currentOrgId).subscribe(claims => {
      this.allClaims.set(claims);

      const pending = claims.filter(c => c.status === 'PENDING');
      this.pendingClaims.set(pending);
      this.pendingCount.set(pending.length);

      // Rough sum, ignoring currency conversion for simplicity here
      this.pendingAmount.set(pending.reduce((acc, curr) => acc + curr.amount, 0));
    });
  }

  async updateStatus(claim: ExpenseClaim, status: ExpenseStatus) {
    if (!claim.id) return;

    try {
      await this.expenseService.updateStatus(claim.id, status);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update claim status');
    }
  }
}
