import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { OrganizationService, Organization } from '../../core/services/organization.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-organization-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold mb-6 text-gray-900">Organization Settings</h1>

      <div *ngIf="loading()" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        <p class="text-gray-500 mt-2">Loading settings...</p>
      </div>

      <div *ngIf="!loading() && !isAdmin()" class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
        <div class="flex items-center">
          <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <div>
            <p class="font-bold">Access Denied</p>
            <p class="text-sm">You do not have permission to view this page. Only administrators can manage organization settings.</p>
          </div>
        </div>
      </div>

      <div *ngIf="!loading() && isAdmin()" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 sm:p-8">
          <form [formGroup]="orgForm" (ngSubmit)="saveSettings()">
            <div class="mb-6">
              <label class="block text-gray-700 text-sm font-semibold mb-2" for="name">
                Organization Name
              </label>
              <input 
                formControlName="name" 
                id="name" 
                type="text" 
                [class.border-red-500]="orgForm.get('name')?.invalid && orgForm.get('name')?.touched"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
              <div *ngIf="orgForm.get('name')?.invalid && orgForm.get('name')?.touched" class="text-red-500 text-xs mt-1">
                <span *ngIf="orgForm.get('name')?.errors?.['required']">Name is required.</span>
                <span *ngIf="orgForm.get('name')?.errors?.['minlength']">Name must be at least 3 characters.</span>
              </div>
            </div>

            <!-- Future: Logo URL, etc. -->

            <div class="flex items-center justify-end">
              <button 
                type="submit" 
                [disabled]="orgForm.invalid || isSaving()"
                class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors shadow-sm">
                {{ isSaving() ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>

        <div class="bg-gray-50 p-6 sm:p-8 border-t border-gray-100">
          <h3 class="text-lg font-semibold text-red-800 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Danger Zone
          </h3>
          <div class="bg-white border border-red-200 rounded-lg p-4 shadow-sm">
            <h4 class="text-gray-900 font-bold mb-2">Delete Organization</h4>
            <p class="text-gray-600 text-sm mb-4">
              Once you delete an organization, there is no going back. All data associated with this organization will be permanently removed.
            </p>
            <button class="bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2 px-4 rounded-lg border border-red-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors" disabled title="Not implemented yet">
              Delete Organization
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrganizationSettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private orgService = inject(OrganizationService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  isAdmin = signal(false);
  isSaving = signal(false);

  currentOrg: Organization | undefined;

  orgForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]]
  });

  async ngOnInit() {
    try {
      const user = this.authService.userSignal();
      if (user) {
        const profile = await firstValueFrom(this.userService.getUserProfile(user.uid));

        if (profile?.role === 'admin') {
          this.isAdmin.set(true);
          if (profile.orgId) {
            const org = await firstValueFrom(this.orgService.getOrganization(profile.orgId));
            if (org) {
              this.currentOrg = org;
              this.orgForm.patchValue({ name: org.name });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async saveSettings() {
    if (this.orgForm.valid && this.currentOrg?.id) {
      this.isSaving.set(true);
      try {
        await this.orgService.updateOrganization(this.currentOrg.id, {
          name: this.orgForm.value.name!
        });
        alert('Settings saved successfully');
      } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings');
      } finally {
        this.isSaving.set(false);
      }
    }
  }
}
