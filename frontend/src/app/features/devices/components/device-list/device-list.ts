import {Component, inject, signal} from '@angular/core';
import {DeviceService} from '../../../../core/services/device.service';
import {Device} from '../../../../core/models/device.model';
import {Router, RouterLink} from "@angular/router";
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatCell, MatHeaderCell, MatHeaderRow, MatRow, MatTable, MatTableModule } from '@angular/material/table';
import { CdkTableModule } from '@angular/cdk/table';
import {MatTooltip} from '@angular/material/tooltip';
import {MatCard, MatCardContent} from '@angular/material/card';
import {RefactorDatePipe} from '../../../../core/pipes/refactorDate.pipe';
import {ConfirmDialog, ConfirmDialogData} from '../../../../core/shared/components/confirm-dialog/confirm-dialog';
import {MatDialog} from '@angular/material/dialog';

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
    MatCardContent
  ],
  templateUrl: './device-list.html',
  styleUrl: './device-list.css',
})

export class DeviceList {
  private deviceService = inject(DeviceService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  devices = signal<Device[]>([]);
  loading = signal(false);
  displayedColumns: string[] = ['name', 'description', 'connectionName', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);

    this.deviceService.getDevices().subscribe({
      next: devices => {
        this.devices.set(devices);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
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
}
