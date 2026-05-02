import {Component, inject, OnInit} from '@angular/core';
import {SensorDataService} from '../../../../core/services/sensor-data.service';
import {SensorDataModel} from '../../../../core/models/sensor-data.model';
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
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {RefactorDatePipe} from '../../../../core/pipes/refactorDate.pipe';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {BaseTable} from '../../../../core/shared/components/base-table/base-table';
import {PageModel, TablePageModel} from '../../../../core/models/table-page.model';
import {map, Observable} from 'rxjs';
import {MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sensor-data-list',
  imports: [
    MatCard,
    MatCardContent,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatProgressSpinner,
    MatRow,
    MatRowDef,
    MatTable,
    RefactorDatePipe,
    MatHeaderCellDef,
    MatPaginator,
    MatSort,
    MatSortHeader,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatIconButton,
    MatTooltip,
  ],
  templateUrl: './sensor-data-list.html',
  styleUrl: './sensor-data-list.css',
})
export class SensorDataList extends BaseTable<SensorDataModel> implements OnInit {
  private sensorDataService = inject(SensorDataService);
  private router = inject(Router);

  readonly displayedColumns = ['number', 'topicName', 'topicPath', 'rawPayload', 'receivedAt', 'actions'];

  protected override defaultSortField(): string {
    return 'receivedAt';
  }

  protected override fetchPage(page: TablePageModel): Observable<PageModel<SensorDataModel>> {
    return this.sensorDataService.getSensorDataPage(page).pipe(
      map(response => ({data: response.data, total: response.total}))
    );
  }

  showSensorData(id: number) {
    this.router.navigate([`/sensordata/${id}`]);
  }

  showTopic(id: number) {
    this.router.navigate([`/topics/edit/${id}`]);
  }
}
