import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrganizationService, Organization } from '../../core/services/organization.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {{ mode() === 'create' ? 'Create Workspace' : 'Join Workspace' }}
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            {{ mode() === 'create' ? 'Start a new organization for your team' : 'Find and join your team\'s organization' }}
          </p>
        </div>

        <div class="flex justify-center space-x-4 mb-6">
          <button 
            (click)="setMode('create')"
            [class]="mode() === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
            Create New
          </button>
          <button 
            (click)="setMode('join')"
            [class]="mode() === 'join' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
            Join Existing
          </button>
        </div>
        
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div *ngIf="mode() === 'create'">
            <label for="orgName" class="block text-sm font-medium text-gray-700">Organization Name</label>
            <div class="mt-1">
              <input 
                id="orgName" 
                type="text" 
                formControlName="orgName"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g. Acme Corp">
            </div>
            <div *ngIf="form.get('orgName')?.invalid && form.get('orgName')?.touched" class="text-red-500 text-xs mt-1">
              Organization name is required (min 3 chars).
            </div>
          </div>

          <div *ngIf="mode() === 'join'">
            <label for="orgSelect" class="block text-sm font-medium text-gray-700">Select Organization</label>
            <div class="mt-1">
              <select 
                id="orgSelect" 
                formControlName="selectedOrgId"
                class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="">Select an organization...</option>
                <option *ngFor="let org of organizations()" [value]="org.id">
                  {{ org.name }}
                </option>
              </select>
            </div>
             <div *ngIf="form.get('selectedOrgId')?.invalid && form.get('selectedOrgId')?.touched" class="text-red-500 text-xs mt-1">
              Please select an organization to join.
            </div>
          </div>

          <div>
            <button 
              type="submit"
              [disabled]="form.invalid || isLoading()"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
              <span class="absolute left-0 inset-y-0 flex items-center pl-3" *ngIf="isLoading()">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isLoading() ? 'Processing...' : (mode() === 'create' ? 'Create & Get Started' : 'Request to Join') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class OnboardingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orgService = inject(OrganizationService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  mode = signal<'create' | 'join'>('create');
  isLoading = signal(false);
  organizations = signal<Organization[]>([]);

  form = this.fb.group({
    orgName: ['', [Validators.required, Validators.minLength(3)]],
    selectedOrgId: ['']
  });

  ngOnInit() {
    this.updateValidators();
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.orgService.getAllOrganizations().subscribe(orgs => {
      this.organizations.set(orgs);
    });
  }

  setMode(mode: 'create' | 'join') {
    this.mode.set(mode);
    this.updateValidators();
    this.form.reset();
  }

  updateValidators() {
    const orgNameControl = this.form.get('orgName');
    const selectedOrgIdControl = this.form.get('selectedOrgId');

    if (this.mode() === 'create') {
      orgNameControl?.setValidators([Validators.required, Validators.minLength(3)]);
      selectedOrgIdControl?.clearValidators();
    } else {
      orgNameControl?.clearValidators();
      selectedOrgIdControl?.setValidators([Validators.required]);
    }
    orgNameControl?.updateValueAndValidity();
    selectedOrgIdControl?.updateValueAndValidity();
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    try {
      const user = this.authService.userSignal();
      if (!user) throw new Error('No authenticated user found');

      if (this.mode() === 'create') {
        const orgName = this.form.value.orgName!;

        // 1. Create Organization
        const orgId = await this.orgService.createOrganization({
          name: orgName,
          ownerId: user.uid,
          createdAt: new Date()
        });

        // 2. Update User Profile (Admin, Active)
        await this.userService.updateUser(user.uid, {
          orgId: orgId,
          role: 'admin',
          status: 'active'
        });

        this.router.navigate(['/dashboard']);
      } else {
        const orgId = this.form.value.selectedOrgId!;

        // Update User Profile (Employee, Pending)
        await this.userService.updateUser(user.uid, {
          orgId: orgId,
          role: 'employee',
          status: 'pending'
        });

        alert('Your request to join has been sent. Please wait for an admin to approve your account.');
        // Redirect to a pending page or dashboard (which will show pending state)
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      console.error('Error in onboarding:', error);
      alert('Failed: ' + error.message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
