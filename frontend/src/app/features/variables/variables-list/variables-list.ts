import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {PageModel, TablePageModel} from '../../../core/models/table-page.model';
import {map, Observable} from 'rxjs';
import {ConfirmDialog, ConfirmDialogData} from '../../../core/shared/components/confirm-dialog/confirm-dialog';
import {BaseTable} from '../../../core/shared/components/base-table/base-table';
import {VariableModel} from '../../../core/models/variable.model';
import {VariableService} from '../../../core/services/variable.service';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatPaginator} from '@angular/material/paginator';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {MatTooltip} from '@angular/material/tooltip';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-variables-list',
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatIcon,
    RouterLink,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatFormField,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIconButton,
    MatInput,
    MatLabel,
    MatPaginator,
    MatProgressSpinner,
    MatRow,
    MatRowDef,
    MatSort,
    MatSortHeader,
    MatTable,
    MatTooltip,
    MatHeaderCellDef
  ],
  templateUrl: './variables-list.html',
  styleUrl: './variables-list.css',
})
export class VariablesList extends BaseTable<VariableModel> {
  private variableService = inject(VariableService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  displayedColumns: string[] = ['name', 'description', 'topicPath', 'value', 'actions'];

  protected override defaultSortField(): string {
    return 'topicPath';
  }

  protected override fetchPage(page: TablePageModel): Observable<PageModel<VariableModel>> {
    return this.variableService.getVariablesPage(page).pipe(
      map(response => ({data: response.data, total: response.total}))
    );
  }

  edit(id: number): void {
    this.router.navigate([`/variables/edit/${id}`]);
  }

  delete(id: number): void {
    const dialog = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Delete Variable',
        message: 'Are you sure you want to delete this Variable? <br><br>' +
          'This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      } satisfies ConfirmDialogData
    });

    dialog.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.variableService.deleteVariable(id).subscribe({
          next: () => this.load()
        });
      }
    });
  }

  showTopic(id: number): void {
    this.router.navigate([`/topics/edit/${id}`]);
  }

  resend(id: number): void {
    this.variableService.resendVariable(id).subscribe({
      next: () => {
        this.snack.open('Variable resent successfully', 'Dismiss', { duration: 3000 });
      },
      error: () => {
        this.snack.open('Failed to resend variable.', 'Dismiss', { duration: 3000 });
      }
    });
  }
}
