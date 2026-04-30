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

  it('createTimeLog method exists', () => {
    expect(typeof service.createTimeLog).toBe('function');
  });

  it('getRecentLogs method exists', () => {
    expect(typeof service.getRecentLogs).toBe('function');
  });

  it('getTodayLogs method exists', () => {
    expect(typeof service.getTodayLogs).toBe('function');
  });

  it('getWeekLogs method exists', () => {
    expect(typeof service.getWeekLogs).toBe('function');
  });

  it('getLogsInRange method exists', () => {
    expect(typeof service.getLogsInRange).toBe('function');
  });
});
