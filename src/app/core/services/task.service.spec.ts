import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { Firestore } from '@angular/fire/firestore';

describe('TaskService', () => {
  let service: TaskService;
  const firestoreSpy = jasmine.createSpyObj('Firestore', ['_']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskService,
        { provide: Firestore, useValue: firestoreSpy }
      ]
    });
    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getTasks method exists', () => {
    expect(typeof service.getTasks).toBe('function');
  });

  it('createTask method exists', () => {
    expect(typeof service.createTask).toBe('function');
  });

  it('updateTask method exists', () => {
    expect(typeof service.updateTask).toBe('function');
  });

  it('deleteTask method exists', () => {
    expect(typeof service.deleteTask).toBe('function');
  });
});
