import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeTrackerComponent } from './time-tracker.component';
import { TimeLogService } from '../../core/services/time-log.service';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { MockTimeLogService, MockAuthService, MockUserService } from '../../core/testing/mocks';

describe('TimeTrackerComponent', () => {
  let component: TimeTrackerComponent;
  let fixture: ComponentFixture<TimeTrackerComponent>;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeTrackerComponent],
      providers: [
        { provide: TimeLogService, useClass: MockTimeLogService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: UserService, useClass: MockUserService }
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

  it('should toggle timer', () => {
    expect(component.isActive()).toBeFalse();
    component.toggle();
    expect(component.isActive()).toBeTrue();
    component.toggle();
    expect(component.isActive()).toBeFalse();
  });
});
