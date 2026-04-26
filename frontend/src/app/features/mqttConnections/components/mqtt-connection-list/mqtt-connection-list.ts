import {Component, inject, OnInit, signal} from '@angular/core';
import {MqttConnectionService} from '../../../../core/services/mqtt-connection.service';
import {MqttConnectionModel} from '../../../../core/models/mqtt-connection.model';
import {Router, RouterLink} from "@angular/router";
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatCell, MatHeaderCell, MatHeaderRow, MatRow, MatTable, MatTableModule } from '@angular/material/table';
import { CdkTableModule } from '@angular/cdk/table';
import {MatTooltip} from '@angular/material/tooltip';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialog, ConfirmDialogData} from '../../../../core/shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-mqtt-connection-list',
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
    MatCardContent
  ],
  templateUrl: './mqtt-connection-list.html',
  styleUrl: './mqtt-connection-list.css',
})

export class MqttConnectionList implements OnInit {
  private mqttConnectionService = inject(MqttConnectionService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  mqttConnections = signal<MqttConnectionModel[]>([]);
  loading = signal(false);
  displayedColumns: string[] = ['name', 'host', 'port', 'status', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);

    this.mqttConnectionService.getMqttConnections().subscribe({
      next: mqttConnections => {
        this.mqttConnections.set(mqttConnections);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  edit(id: number): void {
    this.router.navigate([`/mqttconnections/edit/${id}`]);
  }

  delete(id: number): void {
    const dialog = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Delete Connection',
        message: 'Are you sure you want to delete this connection? <br><br>' +
          'This also deletes every device, topic and rule associated with this mqtt connection. <br><br>' +
          'This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      } satisfies ConfirmDialogData
    });

    dialog.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.mqttConnectionService.deleteMqttConnection(id).subscribe({
          next: () => this.load()
        });
      }
    });
  }

  reconnect(id: number): void {
    this.mqttConnectionService.reconnectMqttConnection(id).subscribe({
      next: () => {
        this.snack.open('Reconnection successful', 'Dismiss', { duration: 3000 });
        this.load();
      },
      error: (err: any) => {
        console.log(err)
        this.snack.open('Reconnection failed: ' + err.error, 'Dismiss', { duration: 3000 });
        this.load();
      }
    });
  }
}
