import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Task, TaskService, TaskStatus } from '../../core/services/task.service';
import { AuthService } from '../../core/auth/auth.service';
import { UserService, UserProfile } from '../../core/services/user.service';
import { firstValueFrom } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, DragDropModule, ReactiveFormsModule],
  template: `
    <div class="p-4 sm:p-6 h-full flex flex-col">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 class="text-2xl font-bold text-gray-900">Tasks Board</h1>
        <button (click)="showAddTaskModal = true" class="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2">
          <span>+</span> Add Task
        </button>
      </div>

      <!-- Add Task Modal -->
      <div *ngIf="showAddTaskModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all">
          <h2 class="text-xl font-bold mb-6 text-gray-900">Add New Task</h2>
          <form [formGroup]="taskForm" (ngSubmit)="addTask()">
            <div class="mb-5">
              <label class="block text-gray-700 text-sm font-semibold mb-2">Title</label>
              <input 
                formControlName="title" 
                [class.border-red-500]="taskForm.get('title')?.invalid && taskForm.get('title')?.touched"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
              <div *ngIf="taskForm.get('title')?.invalid && taskForm.get('title')?.touched" class="text-red-500 text-xs italic mt-1">
                Title is required.
              </div>
            </div>
            <div class="mb-5">
              <label class="block text-gray-700 text-sm font-semibold mb-2">Priority</label>
              <select formControlName="priority" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div class="mb-6">
              <label class="block text-gray-700 text-sm font-semibold mb-2">Assign To</label>
              <select 
                formControlName="assignedTo" 
                [class.border-red-500]="taskForm.get('assignedTo')?.invalid && taskForm.get('assignedTo')?.touched"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                <option *ngFor="let user of orgUsers()" [value]="user.uid">
                  {{ user.displayName || user.email }}
                </option>
              </select>
              <div *ngIf="taskForm.get('assignedTo')?.invalid && taskForm.get('assignedTo')?.touched" class="text-red-500 text-xs italic mt-1">
                Please assign this task to a user.
              </div>
            </div>
            <div class="flex justify-end gap-3">
              <button type="button" (click)="showAddTaskModal = false" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" [disabled]="taskForm.invalid" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                Create
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="flex-1 overflow-x-auto pb-4">
        <div class="flex space-x-6 h-full min-w-max px-1" cdkDropListGroup>
          <!-- TODO Column -->
          <div class="w-80 bg-gray-100/80 rounded-xl p-4 flex flex-col h-full border border-gray-200 shadow-sm">
            <h3 class="font-bold text-gray-700 mb-4 flex justify-between items-center px-1">
              TODO <span class="bg-white text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-mono border border-gray-200 shadow-sm">{{ todoTasks().length }}</span>
            </h3>
            <div
              cdkDropList
              [cdkDropListData]="todoTasks()"
              (cdkDropListDropped)="drop($event, 'TODO')"
              class="space-y-3 overflow-y-auto flex-1 min-h-[100px] pr-1"
            >
              <div *ngFor="let task of todoTasks()" cdkDrag class="bg-white p-4 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md border-l-4 border-gray-400 transition-all group">
                <h4 class="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{{ task.title }}</h4>
                <div class="mt-3 flex justify-between items-center">
                  <span [class]="getPriorityClass(task.priority)" class="text-xs px-2 py-1 rounded-full font-semibold border">{{ task.priority }}</span>
                  <div class="flex -space-x-2 overflow-hidden">
                    <div *ngFor="let uid of task.assignedTo" class="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-400 flex items-center justify-center text-xs text-white" [title]="uid">
                      {{ getUserInitials(uid) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- IN PROGRESS Column -->
          <div class="w-80 bg-blue-50/80 rounded-xl p-4 flex flex-col h-full border border-blue-100 shadow-sm">
            <h3 class="font-bold text-blue-800 mb-4 flex justify-between items-center px-1">
              IN PROGRESS <span class="bg-white text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-mono border border-blue-100 shadow-sm">{{ inProgressTasks().length }}</span>
            </h3>
            <div
              cdkDropList
              [cdkDropListData]="inProgressTasks()"
              (cdkDropListDropped)="drop($event, 'IN_PROGRESS')"
              class="space-y-3 overflow-y-auto flex-1 min-h-[100px] pr-1"
            >
              <div *ngFor="let task of inProgressTasks()" cdkDrag class="bg-white p-4 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md border-l-4 border-blue-500 transition-all group">
                <h4 class="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{{ task.title }}</h4>
                <div class="mt-3 flex justify-between items-center">
                  <span [class]="getPriorityClass(task.priority)" class="text-xs px-2 py-1 rounded-full font-semibold border">{{ task.priority }}</span>
                  <div class="flex -space-x-2 overflow-hidden">
                    <div *ngFor="let uid of task.assignedTo" class="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-400 flex items-center justify-center text-xs text-white" [title]="uid">
                      {{ getUserInitials(uid) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- DONE Column -->
          <div class="w-80 bg-green-50/80 rounded-xl p-4 flex flex-col h-full border border-green-100 shadow-sm">
            <h3 class="font-bold text-green-800 mb-4 flex justify-between items-center px-1">
              DONE <span class="bg-white text-green-800 px-2.5 py-0.5 rounded-full text-xs font-mono border border-green-100 shadow-sm">{{ doneTasks().length }}</span>
            </h3>
            <div
              cdkDropList
              [cdkDropListData]="doneTasks()"
              (cdkDropListDropped)="drop($event, 'DONE')"
              class="space-y-3 overflow-y-auto flex-1 min-h-[100px] pr-1"
            >
              <div *ngFor="let task of doneTasks()" cdkDrag class="bg-white p-4 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md border-l-4 border-green-500 opacity-75 hover:opacity-100 transition-all group">
                <h4 class="font-medium text-gray-900 line-through decoration-gray-400 group-hover:decoration-gray-600">{{ task.title }}</h4>
                <div class="mt-3 flex justify-between items-center">
                  <span [class]="getPriorityClass(task.priority)" class="text-xs px-2 py-1 rounded-full font-semibold border">{{ task.priority }}</span>
                  <div class="flex -space-x-2 overflow-hidden">
                    <div *ngFor="let uid of task.assignedTo" class="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-400 flex items-center justify-center text-xs text-white" [title]="uid">
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
  `
})
export class TasksComponent {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  todoTasks = signal<Task[]>([]);
  inProgressTasks = signal<Task[]>([]);
  doneTasks = signal<Task[]>([]);
  orgUsers = signal<UserProfile[]>([]);

  showAddTaskModal = false;
  currentOrgId: string | undefined;

  taskForm = this.fb.group({
    title: ['', Validators.required],
    priority: ['MEDIUM', Validators.required],
    assignedTo: ['', Validators.required]
  });

  constructor() {
    effect(async () => {
      const user = this.authService.userSignal();
      if (user) {
        try {
          const profile = await firstValueFrom(this.userService.getUserProfile(user.uid));
          this.currentOrgId = profile?.orgId;

          if (this.currentOrgId) {
            console.log('TasksComponent: Loading tasks for org', this.currentOrgId);
            // Load tasks
            this.taskService.getTasks(this.currentOrgId).subscribe(tasks => {
              this.todoTasks.set(tasks.filter(t => t.status === 'TODO'));
              this.inProgressTasks.set(tasks.filter(t => t.status === 'IN_PROGRESS'));
              this.doneTasks.set(tasks.filter(t => t.status === 'DONE'));
            });

            // Load users
            this.userService.getOrgUsers(this.currentOrgId).subscribe({
              next: (users) => {
                console.log('TasksComponent: Loaded org users', users);
                this.orgUsers.set(users);
                // Set default assignee to current user if not already set
                if (!this.taskForm.get('assignedTo')?.value) {
                  this.taskForm.patchValue({ assignedTo: user.uid });
                }
              },
              error: (err) => {
                console.error('TasksComponent: Error loading org users', err);
              }
            });
          } else {
            console.warn('TasksComponent: No orgId found for user', user.uid);
          }
        } catch (err) {
          console.error('TasksComponent: Error fetching user profile', err);
        }
      }
    });
  }

  async drop(event: CdkDragDrop<Task[]>, newStatus: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      // Update in Firestore
      if (task.id) {
        await this.taskService.updateTask(task.id, { status: newStatus as TaskStatus });
      }
    }
  }

  async addTask() {
    if (this.taskForm.valid && this.currentOrgId) {
      const { title, priority, assignedTo } = this.taskForm.value;
      const user = this.authService.userSignal();

      try {
        await this.taskService.createTask({
          title: title!,
          priority: priority as any,
          status: 'TODO',
          description: '',
          assignedTo: [assignedTo!],
          orgId: this.currentOrgId,
          createdAt: new Date()
        });

        this.showAddTaskModal = false;
        this.taskForm.reset({ priority: 'MEDIUM', assignedTo: user?.uid });
      } catch (error) {
        console.error('Error creating task:', error);
      }
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

  getUserInitials(uid: string): string {
    const user = this.orgUsers().find(u => u.uid === uid);
    if (user && user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return '??';
  }
}
