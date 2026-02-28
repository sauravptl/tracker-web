import { TestBed } from '@angular/core/testing';
import { TimeLogService } from './time-log.service';
import { Firestore } from '@angular/fire/firestore';

describe('TimeLogService', () => {
  let service: TimeLogService;
  const firestoreSpy = jasmine.createSpyObj('Firestore', ['_']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TimeLogService,
        { provide: Firestore, useValue: firestoreSpy }
      ]
    });
    service = TestBed.inject(TimeLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
