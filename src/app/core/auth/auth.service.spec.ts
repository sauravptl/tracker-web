import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  const authSpy = jasmine.createSpyObj('Auth', ['onAuthStateChanged', 'currentUser']);
  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  // Mock the user observable from @angular/fire/auth
  // Since we can't easily mock the exported 'user' function directly without more complex setup,
  // we will just test that the service creation works with the injected dependencies.
  // Ideally, we would use a library like 'ng-mocks' or simpler providers.
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Auth, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
