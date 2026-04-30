import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('toasts signal should start empty', () => {
    expect(service.toasts()).toEqual([]);
  });

  it('show() should add a toast', () => {
    service.show('Hello');
    expect(service.toasts().length).toBe(1);
  });

  it('show() toast should have correct message', () => {
    service.show('Test message');
    expect(service.toasts()[0].message).toBe('Test message');
  });

  it('show() toast should have default type info', () => {
    service.show('Test');
    expect(service.toasts()[0].type).toBe('info');
  });

  it('show() with explicit type should set correct type', () => {
    service.show('Test', 'error');
    expect(service.toasts()[0].type).toBe('error');
  });

  it('remove() should remove toast by id', () => {
    service.show('Test', 'info', 0);
    const id = service.toasts()[0].id;
    service.remove(id);
    expect(service.toasts().length).toBe(0);
  });

  it('success() should add a toast with type success', () => {
    service.success('Done');
    expect(service.toasts()[0].type).toBe('success');
  });

  it('error() should add a toast with type error', () => {
    service.error('Oops');
    expect(service.toasts()[0].type).toBe('error');
  });

  it('info() should add a toast with type info', () => {
    service.info('FYI');
    expect(service.toasts()[0].type).toBe('info');
  });

  it('warning() should add a toast with type warning', () => {
    service.warning('Watch out');
    expect(service.toasts()[0].type).toBe('warning');
  });
});
