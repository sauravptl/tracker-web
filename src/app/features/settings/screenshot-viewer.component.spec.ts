import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScreenshotViewerComponent } from './screenshot-viewer.component';
import { ScreenshotService } from '../../core/services/screenshot.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';
import { MockScreenshotService, MockAuthService, MockUserService } from '../../core/testing/mocks';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ScreenshotViewerComponent', () => {
  let component: ScreenshotViewerComponent;
  let fixture: ComponentFixture<ScreenshotViewerComponent>;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenshotViewerComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ScreenshotService, useClass: MockScreenshotService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: UserService, useClass: MockUserService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScreenshotViewerComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    authService.simulateUser({ uid: 'test-user', email: 'test@example.com' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('users() should start empty', () => {
    expect(component.users()).toEqual([]);
  });

  it('enabledCount() should start at 0', () => {
    expect(component.enabledCount()).toBe(0);
  });

  it('getInitials should return correct initials', () => {
    expect(component.getInitials('Jane Smith')).toBe('JS');
  });
});
