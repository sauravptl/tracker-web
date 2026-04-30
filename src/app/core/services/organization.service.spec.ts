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

  it('createOrganization method exists', () => {
    expect(typeof service.createOrganization).toBe('function');
  });

  it('getOrganization method exists', () => {
    expect(typeof service.getOrganization).toBe('function');
  });

  it('getUserOrganizations method exists', () => {
    expect(typeof service.getUserOrganizations).toBe('function');
  });

  it('updateOrganization method exists', () => {
    expect(typeof service.updateOrganization).toBe('function');
  });
});
