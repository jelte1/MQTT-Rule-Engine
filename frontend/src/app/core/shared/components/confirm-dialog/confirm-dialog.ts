import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle,
    MatButton
  ],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  dialogRef = inject(MatDialogRef<ConfirmDialogData>);
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}

export interface ConfirmDialogData {
  title: string;
  message: string | string[];
  confirmText?: string;
  cancelText?: string;
}
