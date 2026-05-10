import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {SensorDataModel} from '../../../../core/models/sensor-data.model';
import {SensorDataService} from '../../../../core/services/sensor-data.service';
import {MatSnackBar} from '@angular/material/snack-bar';
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
import {SignalrService} from '../../../../core/services/signalr.service';
import {MatTooltip} from '@angular/material/tooltip';
import {Router} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatCardHeader,
    MatCardSubtitle,
    MatTable,
    MatHeaderCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatProgressSpinner,
    RefactorDatePipe,
    MatTooltip
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})

export class Dashboard implements OnInit, OnDestroy {

  private readonly sensorDataService = inject(SensorDataService);
  private snack = inject(MatSnackBar);
  private readonly signalrService = inject(SignalrService);
  private router = inject(Router);

  sensorData = signal<SensorDataModel[]>([]);
  loading = signal(false);

  displayedColumns: string[] = ['topicName', 'topicPath', 'rawPayload', 'receivedAt'];

  ngOnInit() {
    this.load();

    this.signalrService.startConnection();

    this.signalrService.sensorData$
      .subscribe({
        next: newSensorData => {
          this.sensorData.update(currentData => [newSensorData, ...currentData].slice(0, 10));
        },
        error: () => {
          this.snack.open('Connection lost. Attempting to reconnect...', 'Dismiss', { duration: 3000 });
        }
      });
  }

  load(): void {
    this.loading.set(true);

    this.sensorDataService.getLatestSensorData(10).subscribe({
      next: sensorData => {
        this.sensorData.set(sensorData);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Failed to load sensor data', 'Dismiss', { duration: 3000 });
      }
    });
  }

  ngOnDestroy() {
    this.signalrService.stopConnection();
  }

  showTopic(topicId: number) {
    this.router.navigate([`/topics/edit/${topicId}`]);
  }

  showSensorData(sensorDataId: number) {
    this.router.navigate([`/sensordata/${sensorDataId}`]);
  }
}
