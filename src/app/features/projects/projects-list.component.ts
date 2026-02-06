import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Project, ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/auth/auth.service';
import { UserService, UserProfile } from '../../core/services/user.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="p-4 sm:p-6 h-full flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Projects</h1>
        <button (click)="showAddProjectModal = true" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
          <span>+</span> New Project
        </button>
      </div>

      <!-- Add/Edit Project Modal -->
      <div *ngIf="showAddProjectModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
          <h2 class="text-xl font-bold mb-6 text-gray-900">{{ editingProject ? 'Edit Project' : 'Create New Project' }}</h2>
          <form [formGroup]="projectForm" (ngSubmit)="saveProject()">
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-semibold mb-2">Project Name</label>
              <input 
                formControlName="name" 
                [class.border-red-500]="projectForm.get('name')?.invalid && projectForm.get('name')?.touched"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
              <div *ngIf="projectForm.get('name')?.invalid && projectForm.get('name')?.touched" class="text-red-500 text-xs italic mt-1">
                Name is required.
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-semibold mb-2">Description</label>
              <textarea 
                formControlName="description" 
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"></textarea>
            </div>

            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-semibold mb-2">Status</label>
              <select formControlName="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div class="mb-6">
              <label class="block text-gray-700 text-sm font-semibold mb-2">Project Manager</label>
              <select formControlName="managerId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                <option [ngValue]="null">Select Manager</option>
                <option *ngFor="let user of orgUsers()" [value]="user.uid">
                  {{ user.displayName || user.email }}
                </option>
              </select>
            </div>

            <div class="flex justify-end gap-3">
              <button type="button" (click)="closeModal()" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" [disabled]="projectForm.invalid" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                {{ editingProject ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Project List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let project of projects()" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" (click)="openProject(project)">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-bold text-gray-900 truncate pr-2">{{ project.name }}</h3>
            <span [class]="getStatusClass(project.status)" class="text-xs px-2 py-1 rounded-full font-semibold border">
              {{ project.status }}
            </span>
          </div>
          <p class="text-gray-600 text-sm mb-4 line-clamp-2 h-10">{{ project.description || 'No description' }}</p>
          
          <div class="flex justify-between items-center text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
            <div class="flex items-center gap-2">
               <div *ngIf="project.managerId" class="flex items-center gap-2" [title]="getUserName(project.managerId)">
                  <div class="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                    {{ getUserInitials(project.managerId) }}
                  </div>
                  <span class="truncate max-w-[100px]">{{ getUserName(project.managerId) }}</span>
               </div>
               <span *ngIf="!project.managerId" class="italic text-gray-400">No Manager</span>
            </div>
            <span>{{ project.createdAt?.toDate() | date:'mediumDate' }}</span>
          </div>

          <div class="mt-4 flex justify-end">
             <button (click)="$event.stopPropagation(); editProject(project)" class="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors">
               Edit
             </button>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="projects().length === 0" class="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mb-4 text-gray-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
          </svg>
          <p class="text-lg font-medium">No projects found</p>
          <p class="text-sm mt-1">Create a new project to get started</p>
        </div>
      </div>
    </div>
  `
})
export class ProjectsListComponent {
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  projects = signal<Project[]>([]);
  orgUsers = signal<UserProfile[]>([]);

  showAddProjectModal = false;
  editingProject: Project | null = null;
  currentOrgId: string | undefined;

  projectForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    status: ['ACTIVE', Validators.required],
    managerId: [null as string | null]
  });

  constructor() {
    effect(() => {
      const user = this.authService.userSignal();
      if (user) {
        this.userService.getUserProfileStream(user.uid).subscribe(profile => {
          this.currentOrgId = profile?.orgId;

          if (this.currentOrgId) {
            // Load projects
            this.projectService.getProjects(this.currentOrgId).subscribe(projects => {
              this.projects.set(projects);
            });

            // Load users for manager selection
            this.userService.getOrgUsers(this.currentOrgId).subscribe(users => {
              this.orgUsers.set(users.filter(u => u.status === 'active'));
            });
          }
        });
      }
    });
  }

  openProject(project: Project) {
    if (project.id) {
      this.router.navigate(['/projects', project.id]);
    }
  }

  editProject(project: Project) {
    this.editingProject = project;
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      status: project.status,
      managerId: project.managerId || null
    });
    this.showAddProjectModal = true;
  }

  closeModal() {
    this.showAddProjectModal = false;
    this.editingProject = null;
    this.projectForm.reset({ status: 'ACTIVE' });
  }

  async saveProject() {
    if (this.projectForm.valid && this.currentOrgId) {
      const { name, description, status, managerId } = this.projectForm.value;

      try {
        if (this.editingProject && this.editingProject.id) {
          await this.projectService.updateProject(this.editingProject.id, {
            name: name!,
            description: description || '',
            status: status as any,
            managerId: managerId || undefined
          });
        } else {
          await this.projectService.createProject({
            name: name!,
            description: description || '',
            status: status as any,
            managerId: managerId || undefined,
            orgId: this.currentOrgId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        this.closeModal();
      } catch (error) {
        console.error('Error saving project:', error);
      }
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getUserName(uid: string): string {
    const user = this.orgUsers().find(u => u.uid === uid);
    return user ? (user.displayName || user.email.split('@')[0]) : 'Unknown';
  }

  getUserInitials(uid: string): string {
    const name = this.getUserName(uid);
    return name.substring(0, 2).toUpperCase();
  }
}
