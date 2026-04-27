import {Component, inject, OnInit} from '@angular/core';
import {RuleService} from '../../../../core/services/rule.service';
import {Router, RouterLink} from '@angular/router';
import {RuleModel} from '../../../../core/models/rule.model';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent} from '@angular/material/card';
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
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatTooltip} from '@angular/material/tooltip';
import {RefactorDatePipe} from '../../../../core/pipes/refactorDate.pipe';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialog, ConfirmDialogData} from '../../../../core/shared/components/confirm-dialog/confirm-dialog';
import {BaseTable} from '../../../../core/shared/components/base-table/base-table';
import {PageModel, TablePageModel} from '../../../../core/models/table-page.model';
import {map, Observable} from 'rxjs';
import {MatPaginator} from '@angular/material/paginator';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatSort, MatSortHeader} from '@angular/material/sort';

@Component({
  selector: 'app-rule-list',
  imports: [
    MatButton,
    MatCard,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatIconButton,
    MatProgressSpinner,
    MatRow,
    MatRowDef,
    MatTable,
    MatTooltip,
    RouterLink,
    MatHeaderCellDef,
    RefactorDatePipe,
    MatCardContent,
    MatPaginator,
    MatFormField,
    MatLabel,
    MatSort,
    MatSortHeader,
    MatInput,
  ],
  templateUrl: './rule-list.html',
  styleUrl: './rule-list.css',
})

export class RuleList extends BaseTable<RuleModel> implements OnInit {
  private ruleService = inject(RuleService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['name', 'description', 'createdAt', 'isActive', 'actions'];

  protected override defaultSortField(): string {
    return 'isActive';
  }

  protected override fetchPage(page: TablePageModel): Observable<PageModel<RuleModel>> {
    return this.ruleService.getRulesPage(page).pipe(
      map(response => ({data: response.data, total: response.total}))
    );
  }

  edit(id: number): void {
    this.router.navigate([`/rules/edit/${id}`]);
  }

  delete(id: number): void {
    const dialog = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Delete Rule',
        message: 'Are you sure you want to delete this rule? <br><br>' +
          'This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      } satisfies ConfirmDialogData
    });

    dialog.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.ruleService.deleteRule(id).subscribe({
          next: () => this.load()
        });
      }
    });
  }
}
