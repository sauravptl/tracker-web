import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScreenshotSettingsComponent } from './screenshot-settings.component';
import { ScreenshotService } from '../../core/services/screenshot.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { MockScreenshotService, MockAuthService, MockUserService, MockToastService } from '../../core/testing/mocks';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ScreenshotSettingsComponent', () => {
  let component: ScreenshotSettingsComponent;
  let fixture: ComponentFixture<ScreenshotSettingsComponent>;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenshotSettingsComponent, FormsModule, NoopAnimationsModule],
      providers: [
        { provide: ScreenshotService, useClass: MockScreenshotService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: UserService, useClass: MockUserService },
        { provide: ToastService, useClass: MockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScreenshotSettingsComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    authService.simulateUser({ uid: 'test-user', email: 'test@example.com' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default interval of 10 minutes', () => {
    expect(component.intervalMinutes).toBe(10);
  });

  it('should have default quality of medium', () => {
    expect(component.quality).toBe('medium');
  });

  it('should have default retention of 30 days', () => {
    expect(component.retentionDays).toBe(30);
  });

  it('isUserEnabled should return false for unknown user', () => {
    expect(component.isUserEnabled('unknown-user')).toBeFalse();
  });

  it('filteredUsers should return all users when search is empty', () => {
    expect(component.filteredUsers()).toEqual(component.users());
  });

  it('getInitials should return initials from display name', () => {
    expect(component.getInitials('John Doe')).toBe('JD');
  });

  it('getInitials should work with email', () => {
    expect(component.getInitials('test@example.com')).toBe('TE');
  });
});
