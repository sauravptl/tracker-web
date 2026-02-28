import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { OrganizationService, Organization } from '../../core/services/organization.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100 relative">
        <button 
          type="button" 
          (click)="logout()" 
          class="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
          title="Sign Out">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {{ mode() === 'create' ? 'Create Workspace' : 'Join Workspace' }}
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            {{ mode() === 'create' ? 'Start a new organization for your team' : "Find and join your team's organization" }}
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

          <div *ngIf="mode() === 'join'" class="relative">
            <label for="orgSearch" class="block text-sm font-medium text-gray-700">Search Organization</label>
            <div class="mt-1 relative">
              <input 
                [formControl]="searchControl"
                id="orgSearch"
                type="text"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Type to search..."
                (focus)="showDropdown.set(true)"
                autocomplete="off">
              
              <!-- Search Dropdown -->
              <div *ngIf="showDropdown() && organizations().length > 0" 
                   class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                <div *ngFor="let org of organizations()" 
                     (click)="selectOrg(org)"
                     class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 text-gray-900">
                     <span class="block truncate font-normal">
                      {{ org.name }}
                     </span>
                </div>
              </div>
              
              <!-- No results message -->
              <div *ngIf="showDropdown() && searchControl.value && organizations().length === 0 && !isSearching()" 
                   class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-2 px-3 text-sm text-gray-500">
                No organizations found.
              </div>
            </div>

            <!-- Selected Organization Display -->
             <div *ngIf="selectedOrg()" class="mt-3 flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-100">
                <div class="flex items-center">
                  <div class="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold mr-3">
                    {{ selectedOrg()?.name?.charAt(0) }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-blue-900">{{ selectedOrg()?.name }}</p>
                    <p class="text-xs text-blue-700">Organization ID: {{ selectedOrg()?.id | slice:0:8 }}...</p>
                  </div>
                </div>
                <button type="button" (click)="clearSelection()" class="text-gray-400 hover:text-red-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
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
  private toastService = inject(ToastService);

  mode = signal<'create' | 'join'>('create');
  isLoading = signal(false);
  isSearching = signal(false);
  organizations = signal<Organization[]>([]);
  showDropdown = signal(false);
  selectedOrg = signal<Organization | null>(null);

  searchControl = new FormControl('');

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  form = this.fb.group({
    orgName: ['', [Validators.required, Validators.minLength(3)]],
    selectedOrgId: ['', [Validators.required]] // Validators will be toggled
  });

  ngOnInit() {
    this.updateValidators();
    this.setupSearch();
  }

  setupSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.isSearching.set(true)),
      switchMap(term => {
        if (!term || term.length < 2) {
          return of([]);
        }
        return this.orgService.searchOrganizations(term).pipe(
          catchError(err => {
            console.error(err);
            return of([]);
          })
        );
      })
    ).subscribe(orgs => {
      this.organizations.set(orgs);
      this.isSearching.set(false);
      this.showDropdown.set(true);
    });
  }

  selectOrg(org: Organization) {
    this.selectedOrg.set(org);
    this.form.patchValue({ selectedOrgId: org.id });
    this.searchControl.setValue('', { emitEvent: false });
    this.showDropdown.set(false);
    this.organizations.set([]);
  }

  clearSelection() {
    this.selectedOrg.set(null);
    this.form.patchValue({ selectedOrgId: '' });
  }

  setMode(mode: 'create' | 'join') {
    this.mode.set(mode);
    this.updateValidators();
    this.form.reset();
    this.searchControl.reset();
    this.selectedOrg.set(null);
    this.organizations.set([]);
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

        this.toastService.success('Your request to join has been sent. Please wait for an admin to approve your account.');
        // Redirect to a pending page or dashboard (which will show pending state)
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      console.error('Error in onboarding:', error);
      this.toastService.error('Failed: ' + error.message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
