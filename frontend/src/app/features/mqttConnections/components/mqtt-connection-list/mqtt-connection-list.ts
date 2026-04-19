import {Component, inject, signal} from '@angular/core';
import {MqttConnectionService} from '../../../../core/services/mqtt-connection.service';
import {MqttConnection} from '../../../../core/models/mqtt-connection.model';
import {Router, RouterLink} from "@angular/router";
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatCell, MatHeaderCell, MatHeaderRow, MatRow, MatTable, MatTableModule } from '@angular/material/table';
import { CdkTableModule } from '@angular/cdk/table';
import {MatTooltip} from '@angular/material/tooltip';
import {MatCard, MatCardContent} from '@angular/material/card';

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

export class MqttConnectionList {
  private mqttConnectionService = inject(MqttConnectionService);
  private router = inject(Router);

  mqttConnections = signal<MqttConnection[]>([]);
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
    this.mqttConnectionService.deleteMqttConnection(id).subscribe({
      next: mqttConnections => {
        this.load();
      }
    });
  }
}
