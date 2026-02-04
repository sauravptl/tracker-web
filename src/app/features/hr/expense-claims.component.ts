import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { ExpenseClaim, ExpenseService } from '../../core/services/expense.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-expense-claims',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">My Expenses</h1>
        <button (click)="showClaimModal = true" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + New Claim
        </button>
      </div>

      <!-- New Claim Modal -->
      <div *ngIf="showClaimModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
          <h2 class="text-xl font-bold mb-4">Submit Expense Claim</h2>
          <form [formGroup]="expenseForm" (ngSubmit)="submitClaim()">
            
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2">Description</label>
              <input 
                formControlName="description" 
                type="text" 
                [class.border-red-500]="expenseForm.get('description')?.invalid && expenseForm.get('description')?.touched"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-colors" 
                placeholder="e.g. Client Dinner">
              <div *ngIf="expenseForm.get('description')?.invalid && expenseForm.get('description')?.touched" class="text-red-500 text-xs italic mt-1">
                Description is required.
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Amount</label>
                <input 
                  type="number" 
                  formControlName="amount" 
                  [class.border-red-500]="expenseForm.get('amount')?.invalid && expenseForm.get('amount')?.touched"
                  class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-colors">
                <div *ngIf="expenseForm.get('amount')?.invalid && expenseForm.get('amount')?.touched" class="text-red-500 text-xs italic mt-1">
                  Valid amount is required.
                </div>
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Currency</label>
                <select formControlName="currency" class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2">Date</label>
              <input 
                type="date" 
                formControlName="date" 
                [class.border-red-500]="expenseForm.get('date')?.invalid && expenseForm.get('date')?.touched"
                class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-colors">
              <div *ngIf="expenseForm.get('date')?.invalid && expenseForm.get('date')?.touched" class="text-red-500 text-xs italic mt-1">
                Date is required.
              </div>
            </div>

            <div class="flex justify-end gap-2">
              <button type="button" (click)="showClaimModal = false" class="text-gray-500 hover:text-gray-700 font-bold py-2 px-4 rounded">
                Cancel
              </button>
              <button type="submit" [disabled]="expenseForm.invalid || isSubmitting" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                {{ isSubmitting ? 'Submitting...' : 'Submit' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Claims List -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div *ngIf="myExpenses().length > 0; else noExpenses" class="overflow-x-auto">
          <table class="min-w-full leading-normal">
            <thead>
              <tr>
                <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Description
                </th>
                <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let claim of myExpenses()">
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {{ claim.date.toDate() | date:'mediumDate' }}
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {{ claim.description }}
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm font-mono">
                  {{ claim.amount | currency:claim.currency }}
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span [class]="getStatusClass(claim.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ claim.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noExpenses>
          <div class="p-6 text-center text-gray-500 italic">
            No expense claims found.
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class ExpenseClaimsComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  myExpenses = signal<ExpenseClaim[]>([]);
  showClaimModal = false;
  isSubmitting = false;
  currentOrgId: string | undefined;

  expenseForm = this.fb.group({
    description: ['', Validators.required],
    amount: ['', [Validators.required, Validators.min(0.01)]],
    currency: ['USD', Validators.required],
    date: ['', Validators.required]
  });

  async ngOnInit() {
    const user = this.authService.userSignal();
    if (user) {
      const profile = await firstValueFrom(this.userService.getUserProfile(user.uid));
      this.currentOrgId = profile?.orgId;

      this.expenseService.getMyExpenses(user.uid).subscribe(claims => {
        this.myExpenses.set(claims);
      });
    }
  }

  async submitClaim() {
    if (this.expenseForm.valid && this.currentOrgId) {
      this.isSubmitting = true;
      const { description, amount, currency, date } = this.expenseForm.value;
      const user = this.authService.userSignal();

      try {
        await this.expenseService.createExpense({
          userId: user!.uid,
          orgId: this.currentOrgId,
          description: description!,
          amount: Number(amount),
          currency: currency!,
          date: new Date(date!),
          status: 'PENDING',
          createdAt: new Date()
        });

        this.showClaimModal = false;
        this.expenseForm.reset({ currency: 'USD' });
      } catch (error) {
        console.error('Error submitting expense claim:', error);
        alert('Failed to submit claim');
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PAID': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  }
}
