import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksComponent } from './tasks.component';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { MockTaskService, MockProjectService, MockAuthService, MockUserService } from '../../core/testing/mocks';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule } from '@angular/forms';

describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksComponent, DragDropModule, ReactiveFormsModule],
      providers: [
        { provide: TaskService, useClass: MockTaskService },
        { provide: ProjectService, useClass: MockProjectService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: UserService, useClass: MockUserService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TasksComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    
    // Simulate logged in user
    authService.simulateUser({ uid: 'test-user', email: 'test@example.com' });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with user and tasks', () => {
    // ngOnInit is called in beforeEach via detectChanges
    expect(component.currentOrgId).toBe('org1');
    // Mocks return empty arrays by default, so we expect empty but initialized
    expect(component.todoTasks()).toEqual([]);
  });
});
