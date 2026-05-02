import {Component, inject, OnInit} from '@angular/core';
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
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatPaginator} from '@angular/material/paginator';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {BaseTable} from '../../../../core/shared/components/base-table/base-table';
import {SentDataModel} from '../../../../core/models/sent-data.model';
import {PageModel, TablePageModel} from '../../../../core/models/table-page.model';
import {map, Observable} from 'rxjs';
import {SentDataService} from '../../../../core/services/sent-data.service';
import {RefactorDatePipe} from '../../../../core/pipes/refactorDate.pipe';
import {MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sent-data-list',
  imports: [
    MatCard,
    MatCardContent,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatFormField,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatInput,
    MatLabel,
    MatPaginator,
    MatProgressSpinner,
    MatRow,
    MatRowDef,
    MatSort,
    MatTable,
    MatHeaderCellDef,
    MatSortHeader,
    RefactorDatePipe,
    MatIconButton,
    MatTooltip
  ],
  templateUrl: './sent-data-list.html',
  styleUrl: './sent-data-list.css',
})
export class SentDataList extends BaseTable<SentDataModel> implements OnInit {
  private sentDataService = inject(SentDataService);
  private router = inject(Router);

  readonly displayedColumns = ['number', 'triggerSensorDataPayload', 'payload', 'status', 'sentAt', 'actions'];

  protected override defaultSortField(): string {
    return 'sentAt';
  }

  protected override fetchPage(page: TablePageModel): Observable<PageModel<SentDataModel>> {
    return this.sentDataService.getSentDataPage(page).pipe(
      map(response => ({
        data: response.data,
        total: response.total
      }))
    );
  }

  showSentData(id: number) {
    this.router.navigate([`/sentdata/${id}`]);
  }

  showSensorData(id: number) {
    this.router.navigate([`/sensordata/${id}`]);
  }
}
