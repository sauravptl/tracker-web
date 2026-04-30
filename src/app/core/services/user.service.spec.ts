import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { Firestore } from '@angular/fire/firestore';

describe('UserService', () => {
  let service: UserService;
  const firestoreSpy = jasmine.createSpyObj('Firestore', ['_']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: Firestore, useValue: firestoreSpy }
      ]
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createUserProfile method exists', () => {
    expect(typeof service.createUserProfile).toBe('function');
  });

  it('getUserProfile method exists', () => {
    expect(typeof service.getUserProfile).toBe('function');
  });

  it('getUserProfileStream method exists', () => {
    expect(typeof service.getUserProfileStream).toBe('function');
  });

  it('getOrgUsers method exists', () => {
    expect(typeof service.getOrgUsers).toBe('function');
  });

  it('updateUser method exists', () => {
    expect(typeof service.updateUser).toBe('function');
  });
});
