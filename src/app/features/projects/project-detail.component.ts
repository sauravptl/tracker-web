import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Project, ProjectService } from '../../core/services/project.service';
import { Task, TaskService, TaskStatus } from '../../core/services/task.service';
import { UserService, UserProfile } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';
import { RichTextEditorComponent } from '../../shared/components/rich-text-editor/rich-text-editor.component';
import { MultiSelectDropdownComponent } from '../../shared/components/multi-select-dropdown/multi-select-dropdown.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DragDropModule, ReactiveFormsModule, RichTextEditorComponent, MultiSelectDropdownComponent],
  template: `
    <div class="h-full flex flex-col bg-white" *ngIf="project(); else loading">
      <!-- Project Header -->
      <div class="border-b px-6 py-4 flex justify-between items-start bg-gray-50">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl font-bold text-gray-900">{{ project()?.name }}</h1>
            <span [class]="getStatusClass(project()?.status!)" class="text-xs px-2 py-1 rounded-full font-semibold border">
              {{ project()?.status }}
            </span>
          </div>
          <p class="text-gray-600 max-w-2xl">{{ project()?.description }}</p>
          <div class="flex items-center gap-4 mt-3 text-sm text-gray-500">
             <div class="flex items-center gap-1">
               <span class="font-medium">Manager:</span>
               <span *ngIf="project()?.managerId">{{ getUserName(project()!.managerId!) }}</span>
               <span *ngIf="!project()?.managerId" class="italic">Unassigned</span>
             </div>
             <div>
               <span class="font-medium">Created:</span> {{ project()?.createdAt?.toDate() | date:'mediumDate' }}
             </div>
          </div>
        </div>
        <div class="flex gap-2">
          <button (click)="showAddTaskModal = true" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
            <span>+</span> Add Task
          </button>
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="flex-1 overflow-x-auto p-4 sm:p-6 bg-gray-100">
        <div class="flex space-x-6 h-full min-w-max">
          
          <div *ngFor="let col of columns" 
               class="w-80 rounded-xl p-4 flex flex-col h-full border shadow-sm transition-colors"
               [ngClass]="getThemeStyles(col.theme).container">
            
            <h3 class="font-bold mb-4 flex justify-between items-center px-1" 
                [ngClass]="getThemeStyles(col.theme).header">
              {{ col.title }}
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono border shadow-sm bg-white"
                    [ngClass]="getThemeStyles(col.theme).badge">
                {{ col.items().length }}
              </span>
            </h3>

            <div
              cdkDropList
              [id]="'list-' + col.id"
              [cdkDropListConnectedTo]="dropListIds"
              [cdkDropListData]="col.items()"
              (cdkDropListDropped)="drop($event, col.id)"
              class="space-y-3 overflow-y-auto flex-1 min-h-[100px] pr-1"
            >
              <div *ngFor="let task of col.items()" cdkDrag 
                [class.border-l-4]="true"
                [class.border-gray-400]="col.theme === 'gray'"
                [class.border-blue-500]="col.theme === 'blue'"
                [class.border-purple-500]="col.theme === 'purple'"
                [class.border-green-500]="col.theme === 'green'"
                [class.border-indigo-500]="col.theme === 'indigo'"
                [class.opacity-75]="col.theme === 'green' || col.theme === 'indigo'"
                class="bg-white p-4 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative">
                
                <button (click)="openEditModal(task)" (mousedown)="$event.stopPropagation()" 
                  class="absolute top-2 right-2 p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all" title="Edit Task">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </button>

                <h4 [class.line-through]="col.theme === 'green' || col.theme === 'indigo'" class="font-medium text-gray-900 group-hover:text-blue-600 transition-colors pr-6">{{ task.title }}</h4>
                
                <div *ngIf="task.description" class="rich-text-content mt-2 text-xs text-gray-500 line-clamp-2" [innerHTML]="task.description"></div>

                <div class="mt-3 flex justify-between items-center">
                  <span [class]="getPriorityClass(task.priority)" class="text-xs px-2 py-1 rounded-full font-semibold border">{{ task.priority }}</span>
                  
                  <div class="flex items-center gap-1.5" *ngIf="task.assignedTo?.length">
                     <div *ngFor="let uid of task.assignedTo" class="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full border border-gray-100" [title]="getUserEmail(uid)">
                        <div class="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold ring-1 ring-white">
                          {{ getUserInitials(uid) }}
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Task Modal -->
      <div *ngIf="showAddTaskModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto">
          <h2 class="text-xl font-bold mb-6 text-gray-900">{{ editingTask ? 'Edit Task' : 'Add New Task' }}</h2>
          <form [formGroup]="taskForm" (ngSubmit)="saveTask()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div class="md:col-span-2">
                <label class="block text-gray-700 text-sm font-semibold mb-2">Title</label>
                <input 
                  formControlName="title" 
                  [class.border-red-500]="taskForm.get('title')?.invalid && taskForm.get('title')?.touched"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
              </div>
              
              <div>
                <label class="block text-gray-700 text-sm font-semibold mb-2">Priority</label>
                <select formControlName="priority" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-semibold mb-2">Assign To</label>
                <app-multi-select-dropdown
                  [users]="orgUsers()"
                  [selectedIds]="taskForm.get('assignedTo')?.value || []"
                  [invalid]="!!(taskForm.get('assignedTo')?.invalid && taskForm.get('assignedTo')?.touched)"
                  (selectionChange)="taskForm.patchValue({ assignedTo: $event })">
                </app-multi-select-dropdown>
                <p class="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-gray-700 text-sm font-semibold mb-2">Description</label>
              <app-rich-text-editor formControlName="description"></app-rich-text-editor>
            </div>

            <div class="flex justify-end gap-3">
              <button type="button" (click)="closeModal()" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" [disabled]="taskForm.invalid" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                {{ editingTask ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <ng-template #loading>
      <div class="h-full flex items-center justify-center">
        <div class="text-gray-500">Loading project...</div>
      </div>
    </ng-template>
  `
})
export class ProjectDetailComponent {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private taskService = inject(TaskService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  project = signal<Project | undefined>(undefined);
  orgUsers = signal<UserProfile[]>([]);

  // Tasks signals
  todoTasks = signal<Task[]>([]);
  inProgressTasks = signal<Task[]>([]);
  qaTasks = signal<Task[]>([]);
  doneTasks = signal<Task[]>([]);
  completedTasks = signal<Task[]>([]);

  showAddTaskModal = false;
  editingTask: Task | null = null;

  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    priority: ['MEDIUM', Validators.required],
    assignedTo: [[] as string[], Validators.required]
  });

  columns = [
    { id: 'TODO' as TaskStatus, title: 'To Do', items: this.todoTasks, theme: 'gray' },
    { id: 'IN_PROGRESS' as TaskStatus, title: 'In Progress', items: this.inProgressTasks, theme: 'blue' },
    { id: 'QA_TEST' as TaskStatus, title: 'QA Test', items: this.qaTasks, theme: 'purple' },
    { id: 'DONE' as TaskStatus, title: 'Done', items: this.doneTasks, theme: 'green' },
    { id: 'COMPLETED' as TaskStatus, title: 'Completed', items: this.completedTasks, theme: 'indigo' }
  ];

  dropListIds = ['list-TODO', 'list-IN_PROGRESS', 'list-QA_TEST', 'list-DONE', 'list-COMPLETED'];

  constructor() {
    this.route.params.subscribe(params => {
      const projectId = params['id'];
      if (projectId) {
        this.loadProject(projectId);
      }
    });

    // Load users (we can assume if user is here, they are auth'd and have an org)
    effect(() => {
      const user = this.authService.userSignal();
      if (user) {
        this.userService.getUserProfileStream(user.uid).subscribe(profile => {
          if (profile?.orgId) {
            this.userService.getOrgUsers(profile.orgId).subscribe(users => {
              this.orgUsers.set(users.filter(u => u.status === 'active'));
            });
          }
        });
      }
    });
  }

  loadProject(projectId: string) {
    this.projectService.getProject(projectId).subscribe(project => {
      this.project.set(project);
      if (project) {
        this.loadTasks(projectId);
      }
    });
  }

  loadTasks(projectId: string) {
    this.taskService.getTasksByProject(projectId).subscribe(tasks => {
      this.todoTasks.set(tasks.filter(t => t.status === 'TODO'));
      this.inProgressTasks.set(tasks.filter(t => t.status === 'IN_PROGRESS'));
      this.qaTasks.set(tasks.filter(t => t.status === 'QA_TEST'));
      this.doneTasks.set(tasks.filter(t => t.status === 'DONE'));
      this.completedTasks.set(tasks.filter(t => t.status === 'COMPLETED'));
    });
  }

  async drop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const prevList = event.previousContainer.data;
      const currList = event.container.data;

      transferArrayItem(prevList, currList, event.previousIndex, event.currentIndex);

      // Update signals
      const prevColumn = this.columns.find(c => c.items() === prevList);
      const currColumn = this.columns.find(c => c.items() === currList);
      if (prevColumn) prevColumn.items.set([...prevList]);
      if (currColumn) currColumn.items.set([...currList]);

      const task = currList[event.currentIndex];
      task.status = newStatus;

      if (task.id) {
        await this.taskService.updateTask(task.id, { status: newStatus });
      }
    }
  }

  openEditModal(task: Task) {
    this.editingTask = task;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      assignedTo: task.assignedTo as any
    });
    this.showAddTaskModal = true;
  }

  closeModal() {
    this.showAddTaskModal = false;
    this.editingTask = null;
    this.taskForm.reset({ priority: 'MEDIUM', assignedTo: [], description: '' });
  }

  async saveTask() {
    if (this.taskForm.valid && this.project()) {
      const { title, description, priority, assignedTo } = this.taskForm.value;
      const project = this.project()!;

      try {
        if (this.editingTask && this.editingTask.id) {
          await this.taskService.updateTask(this.editingTask.id, {
            title: title!,
            description: description || '',
            priority: priority as any,
            assignedTo: assignedTo as any
          });
        } else {
          await this.taskService.createTask({
            title: title!,
            description: description || '',
            priority: priority as any,
            status: 'TODO',
            assignedTo: assignedTo as any,
            orgId: project.orgId,
            projectId: project.id,
            createdAt: new Date()
          });
        }
        this.closeModal();
      } catch (error) {
        console.error('Error saving task:', error);
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

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getUserName(uid: string): string {
    const user = this.orgUsers().find(u => u.uid === uid);
    return user ? (user.displayName || user.email.split('@')[0]) : 'Unknown';
  }

  getUserEmail(uid: string): string {
    const user = this.orgUsers().find(u => u.uid === uid);
    return user ? user.email : '';
  }

  getUserInitials(uid: string): string {
    const name = this.getUserName(uid);
    return name.substring(0, 2).toUpperCase();
  }

  getThemeStyles(theme: string) {
    const styles: any = {
      gray: { container: 'bg-gray-100/80 border-gray-200', header: 'text-gray-700', badge: 'text-gray-600 border-gray-200' },
      blue: { container: 'bg-blue-50/80 border-blue-100', header: 'text-blue-800', badge: 'text-blue-800 border-blue-100' },
      purple: { container: 'bg-purple-50/80 border-purple-100', header: 'text-purple-800', badge: 'text-purple-800 border-purple-100' },
      green: { container: 'bg-green-50/80 border-green-100', header: 'text-green-800', badge: 'text-green-800 border-green-100' },
      indigo: { container: 'bg-indigo-50/80 border-indigo-100', header: 'text-indigo-800', badge: 'text-indigo-800 border-indigo-100' }
    };
    return styles[theme] || styles['gray'];
  }
}
