import {Component, inject, OnInit, signal, ViewChild} from '@angular/core';
import {SensorDataService} from '../../../../core/services/sensor-data.service';
import {SensorDataModel} from '../../../../core/models/sensor-data.model';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
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
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {RefactorDatePipe} from '../../../../core/pipes/refactorDate.pipe';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, MatSortHeader, Sort} from '@angular/material/sort';
import {TablePageModel} from '../../../../core/models/table-page.model';
import {PAGE_SIZE_OPTIONS} from '../../../../core/constants/constants';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';

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
  ],
  templateUrl: './sensor-data-list.html',
  styleUrl: './sensor-data-list.css',
})
export class SensorDataList implements OnInit {
  private sensorDataService = inject(SensorDataService);

  readonly displayedColumns = ['number', 'topicName', 'topicPath', 'rawPayload', 'receivedAt'];
  protected readonly PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;
  private filterSubject = new Subject<string>();

  loading = signal(false);
  tablePage = signal<TablePageModel>({
    pageNumber: 0,
    pageSize: PAGE_SIZE_OPTIONS.MEDIUM,
    sortingField: 'receivedAt',
    sortingOrder: 'desc',
    filterQuery: '',
    totalItems: 0
  });

  dataSource = new MatTableDataSource<SensorDataModel>();

  ngOnInit(): void {
    this.filterSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(value => {
      this.tablePage.update(tp => ({
        ...tp,
        filterQuery: value,
        pageNumber: 0
      }));

      this.load();
    });

    this.load();
  }

  load(): void {
    this.loading.set(true);

    this.sensorDataService.getSensorDataPage(this.tablePage()).subscribe({
      next: (sensorDataPage) => {
        this.dataSource.data = sensorDataPage.sensorData;
        this.tablePage.update(tp => ({ ...tp, totalItems: sensorDataPage.total }));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onPageChange(event: any): void {
    this.tablePage.update(tp => ({
      ...tp,
      pageNumber: event.pageIndex,
      pageSize: event.pageSize
    }));

    this.load();
  }

  onSortChange(sort: Sort): void {
    this.tablePage.update(tp => ({
      ...tp,
      sortingField: sort.active,
      sortingOrder: sort.direction,
      pageNumber: 0
    }));

    this.load();
  }

  onFilterChange(event: KeyboardEvent) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterSubject.next(filterValue);
  }
}
