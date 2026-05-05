import { TestBed } from '@angular/core/testing';
import { ScreenshotService } from './screenshot.service';
import { Firestore } from '@angular/fire/firestore';

describe('ScreenshotService', () => {
  let service: ScreenshotService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ScreenshotService,
        { provide: Firestore, useValue: {} }
      ]
    });
    service = TestBed.inject(ScreenshotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isElectron should be false when electronAPI is not present', () => {
    expect(service.isElectron()).toBeFalse();
  });

  it('isPermissionModalNeeded should return false when not on electron', () => {
    expect(service.isPermissionModalNeeded()).toBeFalse();
  });

  it('dismissPermissionModal should set localStorage flag', () => {
    service.dismissPermissionModal();
    expect(localStorage.getItem('screenshotPermissionDismissed')).toBe('true');
    localStorage.removeItem('screenshotPermissionDismissed');
  });

  it('resetPermissionModal should remove localStorage flag', () => {
    localStorage.setItem('screenshotPermissionDismissed', 'true');
    service.resetPermissionModal();
    expect(localStorage.getItem('screenshotPermissionDismissed')).toBeNull();
  });

  it('getPlatform should return web when not on electron', () => {
    expect(service.getPlatform()).toBe('web');
  });

  it('getScreenshotSettings method exists', () => {
    expect(typeof service.getScreenshotSettings).toBe('function');
  });

  it('saveScreenshotSettings method exists', () => {
    expect(typeof service.saveScreenshotSettings).toBe('function');
  });

  it('getUserCaptures method exists', () => {
    expect(typeof service.getUserCaptures).toBe('function');
  });
});
