import { TestBed } from '@angular/core/testing';
import { ExpenseService } from './expense.service';
import { Firestore } from '@angular/fire/firestore';
import { initializeApp, deleteApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let app: FirebaseApp;
  let firestore: any;

  beforeAll(() => {
    app = initializeApp(
      { projectId: 'test-expense', apiKey: 'test', authDomain: 'test' },
      'test-expense-service'
    );
    firestore = getFirestore(app);
  });

  afterAll(async () => {
    await deleteApp(app);
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExpenseService,
        { provide: Firestore, useValue: firestore }
      ]
    });
    service = TestBed.inject(ExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createExpense method exists', () => {
    expect(typeof service.createExpense).toBe('function');
  });

  it('getMyExpenses method exists', () => {
    expect(typeof service.getMyExpenses).toBe('function');
  });

  it('getOrgExpenses method exists', () => {
    expect(typeof service.getOrgExpenses).toBe('function');
  });

  it('updateStatus method exists', () => {
    expect(typeof service.updateStatus).toBe('function');
  });
});
