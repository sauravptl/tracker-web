import { TestBed } from '@angular/core/testing';
import { OrganizationService } from './organization.service';
import { Firestore } from '@angular/fire/firestore';

describe('OrganizationService', () => {
  let service: OrganizationService;
  const firestoreSpy = jasmine.createSpyObj('Firestore', ['_']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrganizationService,
        { provide: Firestore, useValue: firestoreSpy }
      ]
    });
    service = TestBed.inject(OrganizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
