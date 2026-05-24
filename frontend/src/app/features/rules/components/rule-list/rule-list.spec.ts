import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {of} from 'rxjs';
import {RuleList} from './rule-list';
import {RuleService} from '../../../../core/services/rule.service';
import {MatDialog} from '@angular/material/dialog';

const MOCK_PAGE = {
  total: 2,
  data: [
    { id: 1, name: 'Rule A', description: 'desc', isActive: true, createdAt: '2026-01-01T00:00:00' },
    { id: 2, name: 'Rule B', description: 'desc', isActive: false, createdAt: '2026-01-02T00:00:00' },
  ],
};

describe('RuleList', () => {
  let component: RuleList;
  let fixture: ComponentFixture<RuleList>;
  let ruleService: { getRulesPage: ReturnType<typeof vi.fn>; deleteRule: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    ruleService = {
      getRulesPage: vi.fn().mockReturnValue(of(MOCK_PAGE)),
      deleteRule: vi.fn().mockReturnValue(of(null)),
    };
    dialog = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [RuleList],
      providers: [
        provideRouter([]),
        { provide: RuleService, useValue: ruleService },
        { provide: MatDialog, useValue: dialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RuleList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load rules on ngOnInit and fill the data source', () => {
    // Assert
    expect(ruleService.getRulesPage).toHaveBeenCalled();
    expect(component.dataSource.data).toHaveLength(2);
  });

  it('should set totalItems after loading', () => {
    // Assert
    expect(component.tablePage().totalItems).toBe(2);
  });

  it('edit() should navigate to the rule edit route', () => {
    // arrange
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    // act
    component.edit(1);

    // Assert
    expect(navigateSpy).toHaveBeenCalledWith(['/rules/edit/1']);
  });

  it('delete() should open a confirm dialog', () => {
    // arrange
    const dialogRef = { afterClosed: vi.fn().mockReturnValue(of(false)) };
    dialog.open.mockReturnValue(dialogRef);

    // act
    component.delete(1);

    // Assert
    expect(dialog.open).toHaveBeenCalled();
  });

  it('delete() should call deleteRule and reload when user confirms', async () => {
    // arrange
    const dialogRef = { afterClosed: vi.fn().mockReturnValue(of(true)) };
    dialog.open.mockReturnValue(dialogRef);

    // act
    component.delete(1);
    await fixture.whenStable();

    // Assert
    expect(ruleService.deleteRule).toHaveBeenCalledWith(1);
    expect(ruleService.getRulesPage).toHaveBeenCalledTimes(2); // init + after delete
  });

  it('delete() should NOT call deleteRule when user cancels', async () => {
    // arrange
    const dialogRef = { afterClosed: vi.fn().mockReturnValue(of(false)) };
    dialog.open.mockReturnValue(dialogRef);

    // act
    component.delete(1);
    await fixture.whenStable();

    // Assert
    expect(ruleService.deleteRule).not.toHaveBeenCalled();
  });
});
