import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { TaskService } from '../../core/services/task.service';
import { TimeLogService } from '../../core/services/time-log.service';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { LeaveRequestService } from '../../core/services/leave-request.service';
import { MockTaskService, MockTimeLogService, MockAuthService, MockUserService, MockLeaveRequestService } from '../../core/testing/mocks';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, NoopAnimationsModule],
      providers: [
        { provide: TaskService, useClass: MockTaskService },
        { provide: TimeLogService, useClass: MockTimeLogService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: UserService, useClass: MockUserService },
        { provide: LeaveRequestService, useClass: MockLeaveRequestService },
        provideCharts(withDefaultRegisterables())
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    
    authService.simulateUser({ uid: 'test-user', email: 'test@example.com' });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty task count initially', () => {
    expect(component.myTasksCount()).toBe(0);
  });
});
