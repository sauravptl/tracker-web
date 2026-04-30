import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScreenshotDetailComponent } from './screenshot-detail.component';
import { ScreenshotService } from '../../core/services/screenshot.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { MockScreenshotService, MockAuthService, MockUserService, MockToastService } from '../../core/testing/mocks';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ScreenshotDetailComponent', () => {
  let component: ScreenshotDetailComponent;
  let fixture: ComponentFixture<ScreenshotDetailComponent>;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenshotDetailComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ScreenshotService, useClass: MockScreenshotService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: UserService, useClass: MockUserService },
        { provide: ToastService, useClass: MockToastService },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ userId: 'test-user-id' }), snapshot: { params: { userId: 'test-user-id' } } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScreenshotDetailComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    authService.simulateUser({ uid: 'admin-user', email: 'admin@example.com' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('formatSize for bytes < 1024 should show B', () => {
    expect(component.formatSize(512)).toBe('512 B');
  });

  it('formatSize for kilobytes should show KB', () => {
    expect(component.formatSize(2048)).toBe('2.0 KB');
  });

  it('formatTime should return HH:MM format', () => {
    const timestamp = new Date('2024-01-15T10:30:00');
    const result = component.formatTime(timestamp);
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});
