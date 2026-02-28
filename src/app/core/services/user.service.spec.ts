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
});
