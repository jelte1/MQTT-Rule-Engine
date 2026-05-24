import {TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialog, ConfirmDialogData} from './confirm-dialog';

const MOCK_DATA: ConfirmDialogData = {
  title: 'Delete item',
  message: 'Are you sure?',
  confirmText: 'Yes',
  cancelText: 'No',
};

const mockDialogRef = { close: vi.fn() };

describe('ConfirmDialog', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: MOCK_DATA },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ConfirmDialog);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show injected dialog data', () => {
    const fixture = TestBed.createComponent(ConfirmDialog);
    expect(fixture.componentInstance.data.title).toBe('Delete item');
    expect(fixture.componentInstance.data.message).toBe('Are you sure?');
  });
});
