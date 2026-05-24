import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {RuleForm} from './rule-form';
import {RuleService} from '../../../../core/services/rule.service';
import {TopicService} from '../../../../core/services/topic.service';

const mockRouter = { navigate: vi.fn().mockResolvedValue(true) };
const mockActivatedRoute = { snapshot: { paramMap: { get: vi.fn().mockReturnValue(null) } } };
const mockRuleService = {
  getRule: vi.fn().mockReturnValue(of(null)),
  createRule: vi.fn(),
  updateRule: vi.fn(),
};
const mockTopicService = {
  getTopics: vi.fn().mockReturnValue(of([])),
};
const mockSnack = { open: vi.fn() };

describe('RuleForm', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockTopicService.getTopics.mockReturnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [RuleForm],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: RuleService, useValue: mockRuleService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: MatSnackBar, useValue: mockSnack },
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(RuleForm);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load topics on init', async () => {
    const fixture = TestBed.createComponent(RuleForm);
    await fixture.whenStable();
    expect(mockTopicService.getTopics).toHaveBeenCalled();
  });

  it('isEditMode should be false when no route param', async () => {
    const fixture = TestBed.createComponent(RuleForm);
    await fixture.whenStable();
    expect(fixture.componentInstance.isEditMode()).toBe(false);
  });

  it('create() should call ruleService.createRule', async () => {
    mockRuleService.createRule.mockReturnValue(of({}));
    const fixture = TestBed.createComponent(RuleForm);
    await fixture.whenStable();
    fixture.componentInstance.create();
    expect(mockRuleService.createRule).toHaveBeenCalled();
  });

  it('create() on error should show error snack', async () => {
    mockRuleService.createRule.mockReturnValue(throwError(() => new Error()));
    const fixture = TestBed.createComponent(RuleForm);
    await fixture.whenStable();
    fixture.componentInstance.create();
    expect(mockSnack.open).toHaveBeenCalledWith(
      expect.stringContaining('Failed'),
      'Dismiss',
      expect.any(Object)
    );
  });
});
