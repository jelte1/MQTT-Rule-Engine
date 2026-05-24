import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {VariableForm} from './variable-form';
import {VariableService} from '../../../core/services/variable.service';
import {TopicService} from '../../../core/services/topic.service';

const mockRouter = { navigate: vi.fn().mockResolvedValue(true) };
const mockActivatedRoute = { snapshot: { paramMap: { get: vi.fn().mockReturnValue(null) } } };
const mockVariableService = {
  getVariable: vi.fn().mockReturnValue(of(null)),
  createVariable: vi.fn(),
  updateVariable: vi.fn(),
};
const mockTopicService = {
  getTopics: vi.fn().mockReturnValue(of([])),
};
const mockSnack = { open: vi.fn() };

describe('VariablesForm', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockTopicService.getTopics.mockReturnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [VariableForm],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: VariableService, useValue: mockVariableService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: MatSnackBar, useValue: mockSnack },
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(VariableForm);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load topics on init', async () => {
    const fixture = TestBed.createComponent(VariableForm);
    await fixture.whenStable();
    expect(mockTopicService.getTopics).toHaveBeenCalled();
  });

  it('isEditMode should be false when no route param', async () => {
    const fixture = TestBed.createComponent(VariableForm);
    await fixture.whenStable();
    expect(fixture.componentInstance.isEditMode()).toBe(false);
  });

  it('create() should call variableService.createVariable', async () => {
    mockVariableService.createVariable.mockReturnValue(of({}));
    const fixture = TestBed.createComponent(VariableForm);
    await fixture.whenStable();
    fixture.componentInstance.create();
    expect(mockVariableService.createVariable).toHaveBeenCalled();
  });

  it('create() on error should show error snack', async () => {
    mockVariableService.createVariable.mockReturnValue(throwError(() => new Error()));
    const fixture = TestBed.createComponent(VariableForm);
    await fixture.whenStable();
    fixture.componentInstance.create();
    expect(mockSnack.open).toHaveBeenCalledWith(
      expect.stringContaining('Failed'),
      'Dismiss',
      expect.any(Object)
    );
  });
});
