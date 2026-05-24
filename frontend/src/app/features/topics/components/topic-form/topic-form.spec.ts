import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TopicForm} from './topic-form';
import {TopicService} from '../../../../core/services/topic.service';
import {DeviceService} from '../../../../core/services/device.service';

const mockRouter = { navigate: vi.fn().mockResolvedValue(true) };
const mockActivatedRoute = { snapshot: { paramMap: { get: vi.fn().mockReturnValue(null) } } };
const mockTopicService = {
  getTopic: vi.fn().mockReturnValue(of(null)),
  createTopic: vi.fn(),
  updateTopic: vi.fn(),
};
const mockDeviceService = {
  getDevices: vi.fn().mockReturnValue(of([])),
};
const mockSnack = { open: vi.fn() };

describe('TopicForm', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockDeviceService.getDevices.mockReturnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [TopicForm],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: TopicService, useValue: mockTopicService },
        { provide: DeviceService, useValue: mockDeviceService },
        { provide: MatSnackBar, useValue: mockSnack },
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(TopicForm);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load devices on init', async () => {
    const fixture = TestBed.createComponent(TopicForm);
    await fixture.whenStable();
    expect(mockDeviceService.getDevices).toHaveBeenCalled();
  });

  it('isEditMode should be false when no route param', async () => {
    const fixture = TestBed.createComponent(TopicForm);
    await fixture.whenStable();
    expect(fixture.componentInstance.isEditMode()).toBe(false);
  });

  it('create() should call topicService.createTopic', async () => {
    mockTopicService.createTopic.mockReturnValue(of({}));
    const fixture = TestBed.createComponent(TopicForm);
    await fixture.whenStable();
    fixture.componentInstance.create();
    expect(mockTopicService.createTopic).toHaveBeenCalled();
  });

  it('create() on error should show error snack', async () => {
    mockTopicService.createTopic.mockReturnValue(throwError(() => new Error()));
    const fixture = TestBed.createComponent(TopicForm);
    await fixture.whenStable();
    fixture.componentInstance.create();
    expect(mockSnack.open).toHaveBeenCalledWith(
      expect.stringContaining('Failed'),
      'Dismiss',
      expect.any(Object)
    );
  });
});
