import {Component, inject, OnInit} from '@angular/core';
import {TopicService} from '../../../../core/services/topic.service';
import {Router, RouterLink} from '@angular/router';
import {TopicModel} from '../../../../core/models/topic.model';
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
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialog, ConfirmDialogData} from '../../../../core/shared/components/confirm-dialog/confirm-dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {BaseTable} from '../../../../core/shared/components/base-table/base-table';
import {map, Observable} from 'rxjs';
import {PageModel, TablePageModel} from '../../../../core/models/table-page.model';

@Component({
  selector: 'app-topic-list',
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
    MatCardContent,
    MatPaginator,
    MatSort,
    MatSortHeader,
    MatFormField,
    MatLabel,
    MatInput
  ],
  templateUrl: './topic-list.html',
  styleUrl: './topic-list.css',
})
export class TopicList extends BaseTable<TopicModel> implements OnInit {
  private topicService = inject(TopicService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['name', 'topicPath', 'description', 'deviceName', 'Actions'];

  protected override defaultSortField(): string {
    return 'deviceName';
  }

  protected override fetchPage(page: TablePageModel): Observable<PageModel<TopicModel>> {
    return this.topicService.getTopicsPage(page).pipe(
      map(response => ({data: response.data, total: response.total}))
    );
  }

  edit(id: number): void {
    this.router.navigate([`/topics/edit/${id}`]);
  }

  delete(id: number): void {
    const dialog = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Delete Topic',
        message: 'Are you sure you want to delete this rule? <br><br>' +
          'This also deletes every rule associated with this topic. <br><br>' +
          'This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      } satisfies ConfirmDialogData
    });

    dialog.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.topicService.deleteTopic(id).subscribe({
          next: () => this.load()
        });
      }
    });
  }

  showDevice(id: number): void {
    this.router.navigate([`/devices/edit/${id}`]);
  }
}
