import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Task, TaskService, TaskStatus } from '../../core/services/task.service';
import { Project, ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/auth/auth.service';
import { UserService, UserProfile } from '../../core/services/user.service';
import { firstValueFrom } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { RichTextEditorComponent } from '../../shared/components/rich-text-editor/rich-text-editor.component';
import { MultiSelectDropdownComponent } from '../../shared/components/multi-select-dropdown/multi-select-dropdown.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, DragDropModule, ReactiveFormsModule, FormsModule, RichTextEditorComponent, MultiSelectDropdownComponent],
  template: `
    <div class="p-4 sm:p-6 h-full flex flex-col">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 class="text-2xl font-bold text-gray-900">Tasks Board</h1>
        
        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <!-- Project Filter -->
          <select 
            [ngModel]="selectedProjectFilter()" 
            (ngModelChange)="onProjectFilterChange($event)"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm">
            <option [ngValue]="null">All Projects</option>
            <option *ngFor="let project of projects()" [value]="project.id">
              {{ project.name }}
            </option>
          </select>

          <button (click)="openAddModal()" class="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2">
            <span>+</span> Add Task
          </button>
        </div>
      </div>

      <!-- Add Task Modal -->
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
                <div *ngIf="taskForm.get('title')?.invalid && taskForm.get('title')?.touched" class="text-red-500 text-xs italic mt-1">
                  Title is required.
                </div>
              </div>
              
              <div>
                <label class="block text-gray-700 text-sm font-semibold mb-2">Project</label>
                <select formControlName="projectId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                  <option [ngValue]="null">No Project</option>
                  <option *ngFor="let project of projects()" [value]="project.id">
                    {{ project.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-semibold mb-2">Priority</label>
                <select formControlName="priority" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="block text-gray-700 text-sm font-semibold mb-2">Assign To</label>
                <app-multi-select-dropdown
                  [users]="orgUsers()"
                  [selectedIds]="taskForm.get('assignedTo')?.value || []"
                  [invalid]="!!(taskForm.get('assignedTo')?.invalid && taskForm.get('assignedTo')?.touched)"
                  (selectionChange)="taskForm.patchValue({ assignedTo: $event })">
                </app-multi-select-dropdown>
                <div *ngIf="taskForm.get('assignedTo')?.invalid && taskForm.get('assignedTo')?.touched" class="text-red-500 text-xs italic mt-1">
                  Please assign this task to a user.
                </div>
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

      <div class="flex-1 overflow-x-auto pb-4">
        <div class="flex space-x-6 h-full min-w-max px-1">
          
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
              (cdkDropListEntered)="onDragEntered($event)"
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
                  [class.text-gray-400]="col.theme === 'gray'"
                  [class.text-blue-400]="col.theme === 'blue'"
                  [class.text-purple-400]="col.theme === 'purple'"
                  [class.text-green-600]="col.theme === 'green'"
                  [class.text-indigo-600]="col.theme === 'indigo'"
                  class="absolute top-2 right-2 p-1 hover:text-opacity-80 opacity-0 group-hover:opacity-100 transition-opacity" title="Edit Task">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </button>

                <!-- Project Badge -->
                <div *ngIf="task.projectId" class="mb-2">
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    {{ getProjectName(task.projectId) }}
                  </span>
                </div>

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
    </div>
  `
})
export class TasksComponent {
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  todoTasks = signal<Task[]>([]);
  inProgressTasks = signal<Task[]>([]);
  qaTasks = signal<Task[]>([]);
  doneTasks = signal<Task[]>([]);
  completedTasks = signal<Task[]>([]);

  orgUsers = signal<UserProfile[]>([]);
  projects = signal<Project[]>([]);
  selectedProjectFilter = signal<string | null>(null);

  showAddTaskModal = false;
  editingTask: Task | null = null;
  currentOrgId: string | undefined;

  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    priority: ['MEDIUM', Validators.required],
    assignedTo: [[] as string[], Validators.required],
    projectId: [null as string | null]
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

            this.loadTasks();

            // Load users
            this.userService.getOrgUsers(this.currentOrgId).subscribe({
              next: (users) => {
                const activeUsers = users.filter(u => u.status === 'active');
                this.orgUsers.set(activeUsers);
                // Initialize assignedTo with current user if empty and new
                if (!this.taskForm.get('assignedTo')?.value?.length && !this.editingTask) {
                  this.taskForm.patchValue({ assignedTo: [user.uid] as any });
                }
              },
              error: (err) => {
                console.error('TasksComponent: Error loading org users', err);
              }
            });
          }
        });
      }
    });
  }

  loadTasks() {
    if (!this.currentOrgId) return;

    const user = this.authService.userSignal();
    if (!user) return;

    // Load tasks based on filter
    const projectId = this.selectedProjectFilter();
    let tasksObservable;

    if (projectId) {
      tasksObservable = this.taskService.getTasksByProject(projectId);
    } else {
      tasksObservable = this.taskService.getMyTasks(user.uid);
    }

    tasksObservable.subscribe(tasks => {
      this.todoTasks.set(tasks.filter(t => t.status === 'TODO'));
      this.inProgressTasks.set(tasks.filter(t => t.status === 'IN_PROGRESS'));
      this.qaTasks.set(tasks.filter(t => t.status === 'QA_TEST'));
      this.doneTasks.set(tasks.filter(t => t.status === 'DONE'));
      this.completedTasks.set(tasks.filter(t => t.status === 'COMPLETED'));
    });
  }

  onProjectFilterChange(projectId: string | null) {
    this.selectedProjectFilter.set(projectId);
    this.loadTasks();
  }

  openAddModal() {
    this.showAddTaskModal = true;
    // Auto-select project if filter is active
    if (this.selectedProjectFilter()) {
      this.taskForm.patchValue({ projectId: this.selectedProjectFilter() });
    }
  }

  async drop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const prevList = event.previousContainer.data;
      const currList = event.container.data;

      transferArrayItem(
        prevList,
        currList,
        event.previousIndex,
        event.currentIndex,
      );

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

  onDragEntered(event: any) {
    // console.log('Drag entered:', event.container.id);
  }

  openEditModal(task: Task) {
    this.editingTask = task;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      assignedTo: task.assignedTo as any,
      projectId: task.projectId || null
    });
    this.showAddTaskModal = true;
  }

  closeModal() {
    this.showAddTaskModal = false;
    this.editingTask = null;
    const user = this.authService.userSignal();
    this.taskForm.reset({
      priority: 'MEDIUM',
      assignedTo: user?.uid ? [user.uid] : [],
      description: '',
      projectId: this.selectedProjectFilter()
    });
  }

  async saveTask() {
    if (this.taskForm.valid && this.currentOrgId) {
      const { title, description, priority, assignedTo, projectId } = this.taskForm.value;

      try {
        if (this.editingTask && this.editingTask.id) {
          await this.taskService.updateTask(this.editingTask.id, {
            title: title!,
            description: description || '',
            priority: priority as any,
            assignedTo: assignedTo as any,
            projectId: projectId || undefined
          });
        } else {
          await this.taskService.createTask({
            title: title!,
            description: description || '',
            priority: priority as any,
            status: 'TODO',
            assignedTo: assignedTo as any,
            orgId: this.currentOrgId,
            projectId: projectId || undefined,
            createdAt: new Date()
          });
        }

        this.closeModal();
      } catch (error) {
        console.error('Error saving task:', error);
      }
    }
  }

  getProjectName(projectId: string): string {
    const project = this.projects().find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getUserInitials(uid: string): string {
    const user = this.orgUsers().find(u => u.uid === uid);
    if (user && user.email) {
      return (user.displayName || user.email).substring(0, 2).toUpperCase();
    }
    return '??';
  }

  getUserDisplayName(uid: string): string {
    const user = this.orgUsers().find(u => u.uid === uid);
    if (user) {
      return user.displayName || user.email.split('@')[0];
    }
    return 'Unknown';
  }

  getUserEmail(uid: string): string {
    const user = this.orgUsers().find(u => u.uid === uid);
    return user ? user.email : '';
  }

  getThemeStyles(theme: string) {
    const styles: any = {
      gray: {
        container: 'bg-gray-100/80 border-gray-200',
        header: 'text-gray-700',
        badge: 'text-gray-600 border-gray-200'
      },
      blue: {
        container: 'bg-blue-50/80 border-blue-100',
        header: 'text-blue-800',
        badge: 'text-blue-800 border-blue-100'
      },
      purple: {
        container: 'bg-purple-50/80 border-purple-100',
        header: 'text-purple-800',
        badge: 'text-purple-800 border-purple-100'
      },
      green: {
        container: 'bg-green-50/80 border-green-100',
        header: 'text-green-800',
        badge: 'text-green-800 border-green-100'
      },
      indigo: {
        container: 'bg-indigo-50/80 border-indigo-100',
        header: 'text-indigo-800',
        badge: 'text-indigo-800 border-indigo-100'
      }
    };
    return styles[theme] || styles['gray'];
  }
}
