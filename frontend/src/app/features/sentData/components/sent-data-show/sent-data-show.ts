import {Component, inject, OnInit, signal} from '@angular/core';
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {SentDataService} from '../../../../core/services/sent-data.service';
import {SensorDataService} from '../../../../core/services/sensor-data.service';
import {ActivatedRoute, Router} from '@angular/router';
import {SentDataModel} from '../../../../core/models/sent-data.model';
import {SensorDataModel} from '../../../../core/models/sensor-data.model';
import {RefactorDatePipe} from '../../../../core/pipes/refactorDate.pipe';

@Component({
  selector: 'app-sent-data-show',
  imports: [
    MatCard,
    MatCardContent,
    MatIcon,
    MatIconButton,
    MatTooltip,
    MatLabel,
    MatFormField,
    MatInput,
    MatProgressSpinner,
    MatCardHeader,
    MatCardTitle,
    MatButton,
    RefactorDatePipe,
    MatCardActions
  ],
  templateUrl: './sent-data-show.html',
  styleUrl: './sent-data-show.css',
})
export class SentDataShow implements OnInit {
  private sentDataService = inject(SentDataService);
  private sensorDataService = inject(SensorDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  sentData = signal<SentDataModel | null>(null);
  sensorData = signal<SensorDataModel | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);

    this.sentDataService.getSentData(id).subscribe({
      next: (data) => {
        this.sentData.set(data);
        if (data.triggerSensorDataId) {
          this.sensorDataService.getSensorData(data.triggerSensorDataId).subscribe({
            next: (sensorData) => {
              this.sensorData.set(sensorData);
              this.loading.set(false);
            },
            error: () => this.loading.set(false)
          });
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.router.navigate(['/sentdata']);
        this.loading.set(false);
      }
    });
  }

  back(): void {
    this.router.navigate(['/sentdata']);
  }

  showSensorData(id: number | undefined): void {
    this.router.navigate([`/sensordata/${id}`]);
  }

  showRule(id: number | undefined): void {
    this.router.navigate([`/rules/edit/${id}`]);
  }
}
