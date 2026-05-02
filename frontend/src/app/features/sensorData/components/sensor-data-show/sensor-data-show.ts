import {Component, inject, OnInit, signal} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {forkJoin} from 'rxjs';
import {SensorDataService} from '../../../../core/services/sensor-data.service';
import {ActivatedRoute, Router} from '@angular/router';
import {SensorDataModel} from '../../../../core/models/sensor-data.model';
import {SentDataModel} from '../../../../core/models/sent-data.model';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {RefactorDatePipe} from '../../../../core/pipes/refactorDate.pipe';
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
import {SentDataService} from '../../../../core/services/sent-data.service';
import {MatSort, MatSortHeader} from '@angular/material/sort';

@Component({
  selector: 'app-sensor-data-show',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatIcon,
    MatIconButton,
    MatTooltip,
    MatCard,
    MatProgressSpinner,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    RefactorDatePipe,
    MatCardHeader,
    MatCardTitle,
    MatTable,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatColumnDef,
    MatHeaderRowDef,
    MatRow,
    MatHeaderRow,
    MatRowDef,
    MatSortHeader,
    MatSort
  ],
  templateUrl: './sensor-data-show.html',
  styleUrl: './sensor-data-show.css',
})
export class SensorDataShow implements OnInit {
  private sensorDataService = inject(SensorDataService);
  private sentDataService = inject(SentDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  // private location = inject(Location);

  loading = signal(false);
  sensorData = signal<SensorDataModel | null>(null);
  sentData = signal<SentDataModel[]>([]);

  sentDataColumns = ['ruleName', 'sentTopicPath', 'payload', 'status'];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);

    forkJoin({
      sensorData: this.sensorDataService.getSensorData(id),
      sentData: this.sentDataService.getSentDataBySensorId(id)
    }).subscribe({
      next: ({ sensorData, sentData }) => {
        this.sensorData.set(sensorData);
        this.sentData.set(sentData);
        this.loading.set(false);
      },
      error: () => {
        this.router.navigate(['/sensordata']);
        this.loading.set(false);
      }
    });
  }

  back(): void {
    // this.location.back();
  }

  showRule(id: number): void {
    this.router.navigate([`/rules/edit/${id}`]);
  }

  showSentData(id: number): void {
    this.router.navigate([`/sentdata/${id}`]);
  }
}
