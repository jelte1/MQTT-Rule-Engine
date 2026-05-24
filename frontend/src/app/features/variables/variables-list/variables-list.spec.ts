import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {of} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {VariablesList} from './variables-list';
import {VariableService} from '../../../core/services/variable.service';

const MOCK_PAGE = { data: [{ id: 1, name: 'LightState', value: 'off', topicPath: 'home/light' }], total: 1 };

const mockVariableService = {
  getVariablesPage: vi.fn().mockReturnValue(of(MOCK_PAGE)),
  deleteVariable: vi.fn().mockReturnValue(of({})),
  resendVariable: vi.fn().mockReturnValue(of({})),
};
const mockSnack = { open: vi.fn() };
const mockDialog = { open: vi.fn() };

describe('VariablesList', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockVariableService.getVariablesPage.mockReturnValue(of(MOCK_PAGE));
    await TestBed.configureTestingModule({
      imports: [VariablesList],
      providers: [
        provideRouter([]),
        { provide: VariableService, useValue: mockVariableService },
        { provide: MatSnackBar, useValue: mockSnack },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(VariablesList);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load variables on init', async () => {
    const fixture = TestBed.createComponent(VariablesList);
    await fixture.whenStable();
    expect(mockVariableService.getVariablesPage).toHaveBeenCalled();
  });

  it('should fill dataSource after load', async () => {
    const fixture = TestBed.createComponent(VariablesList);
    await fixture.whenStable();
    expect(fixture.componentInstance.dataSource.data).toHaveLength(1);
  });

  it('delete() should open confirm dialog', async () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of(false) });
    const fixture = TestBed.createComponent(VariablesList);
    await fixture.whenStable();
    fixture.componentInstance.delete(1);
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('delete() confirmed should call deleteVariable', async () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of(true) });
    const fixture = TestBed.createComponent(VariablesList);
    await fixture.whenStable();
    fixture.componentInstance.delete(1);
    expect(mockVariableService.deleteVariable).toHaveBeenCalledWith(1);
  });
});
