import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeTrackerComponent } from './time-tracker.component';
import { TimeLogService } from '../../core/services/time-log.service';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { MockTimeLogService, MockAuthService, MockUserService, MockToastService } from '../../core/testing/mocks';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TimeTrackerComponent', () => {
  let component: TimeTrackerComponent;
  let fixture: ComponentFixture<TimeTrackerComponent>;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeTrackerComponent, NoopAnimationsModule],
      providers: [
        { provide: TimeLogService, useClass: MockTimeLogService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: UserService, useClass: MockUserService },
        { provide: ToastService, useClass: MockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TimeTrackerComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;

    authService.simulateUser({ uid: 'test-user', email: 'test@example.com' });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize recentLogs to empty array', () => {
    expect(component.recentLogs()).toEqual([]);
  });

  it('formatDuration(0) should return 00:00:00', () => {
    expect(component.formatDuration(0)).toBe('00:00:00');
  });

  it('formatDuration(3661) should return 01:01:01', () => {
    expect(component.formatDuration(3661)).toBe('01:01:01');
  });

  it('formatDuration(3600) should return 01:00:00', () => {
    expect(component.formatDuration(3600)).toBe('01:00:00');
  });
});
