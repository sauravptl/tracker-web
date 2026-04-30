import { TestBed } from '@angular/core/testing';
import { LeaveRequestService } from './leave-request.service';
import { Firestore } from '@angular/fire/firestore';
import { initializeApp, deleteApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

describe('LeaveRequestService', () => {
  let service: LeaveRequestService;
  let app: FirebaseApp;
  let firestore: any;

  beforeAll(() => {
    app = initializeApp(
      { projectId: 'test-leave', apiKey: 'test', authDomain: 'test' },
      'test-leave-request-service'
    );
    firestore = getFirestore(app);
  });

  afterAll(async () => {
    await deleteApp(app);
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LeaveRequestService,
        { provide: Firestore, useValue: firestore }
      ]
    });
    service = TestBed.inject(LeaveRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createLeaveRequest method exists', () => {
    expect(typeof service.createLeaveRequest).toBe('function');
  });

  it('getMyRequests method exists', () => {
    expect(typeof service.getMyRequests).toBe('function');
  });

  it('getOrgRequests method exists', () => {
    expect(typeof service.getOrgRequests).toBe('function');
  });

  it('updateStatus method exists', () => {
    expect(typeof service.updateStatus).toBe('function');
  });
});
