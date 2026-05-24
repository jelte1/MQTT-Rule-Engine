import {Component, inject} from '@angular/core';
import {DeviceService} from '../../../../core/services/device.service';
import {Router, RouterLink} from "@angular/router";
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatCell, MatHeaderCell, MatHeaderRow, MatRow, MatTable, MatTableModule} from '@angular/material/table';
import {CdkTableModule} from '@angular/cdk/table';
import {MatTooltip} from '@angular/material/tooltip';
import {MatCard, MatCardContent} from '@angular/material/card';
import {RefactorDatePipe} from '../../../../core/pipes/refactorDate.pipe';
import {ConfirmDialog, ConfirmDialogData} from '../../../../core/shared/components/confirm-dialog/confirm-dialog';
import {MatDialog} from '@angular/material/dialog';
import {PageModel, TablePageModel} from '../../../../core/models/table-page.model';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {map, Observable} from 'rxjs';
import {BaseTable} from '../../../../core/shared/components/base-table/base-table';
import {DeviceModel} from '../../../../core/models/device.model';

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [
    CdkTableModule,
    MatTableModule,
    MatIcon,
    RouterLink,
    MatButton,
    MatProgressSpinner,
    MatTable,
    MatHeaderRow,
    MatHeaderCell,
    MatRow,
    MatCell,
    MatIconButton,
    MatTooltip,
    MatCard,
    RefactorDatePipe,
    MatCardContent,
    MatPaginator,
    MatSort,
    MatSortHeader,
    MatLabel,
    MatFormField,
    MatInput
  ],
  templateUrl: './device-list.html',
  styleUrl: './device-list.css',
})

export class DeviceList extends BaseTable<DeviceModel> {
  private deviceService = inject(DeviceService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['name', 'description', 'connectionName', 'createdAt', 'Actions'];

  protected override defaultSortField(): string {
    return 'connectionName';
  }

  protected override fetchPage(page: TablePageModel): Observable<PageModel<DeviceModel>> {
    return this.deviceService.getDevicesPage(page).pipe(
      map(response => ({data: response.data, total: response.total}))
    );
  }

  edit(id: number): void {
    this.router.navigate([`/devices/edit/${id}`]);
  }

  delete(id: number): void {
    const dialog = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Delete Device',
        message: 'Are you sure you want to delete this device? <br><br>' +
          'This also deletes every topic and rule associated with this device. <br><br>' +
          'This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      } satisfies ConfirmDialogData
    });

    dialog.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deviceService.deleteDevice(id).subscribe({
          next: () => this.load()
        });
      }
    });
  }

  showMqttConnection(id: number): void {
    this.router.navigate([`/mqttconnections/edit/${id}`]);
  }
}
