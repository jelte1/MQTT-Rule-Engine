import {Component, inject, OnInit, signal} from '@angular/core';
import {RuleService} from '../../../../core/services/rule.service';
import {Router, RouterLink} from '@angular/router';
import {Rule} from '../../../../core/models/rule.model';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent} from '@angular/material/card';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from '@angular/material/table';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatTooltip} from '@angular/material/tooltip';
import {RefactorDatePipe} from '../../../../core/pipes/refactorDate.pipe';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialog, ConfirmDialogData} from '../../../../core/shared/components/confirm-dialog/confirm-dialog';

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
    MatCardContent
  ],
  templateUrl: './rule-list.html',
  styleUrl: './rule-list.css',
})

export class RuleList implements OnInit {
  private ruleService = inject(RuleService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  rules = signal<Rule[]>([]);
  loading = signal(false);
  displayedColumns: string[] = ['name', 'description', 'createdAt', 'isActive', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);

    this.ruleService.getRules().subscribe({
      next: rules => {
        this.rules.set(rules);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
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
