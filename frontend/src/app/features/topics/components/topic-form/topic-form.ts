import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TopicService} from '../../../../core/services/topic.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CreateTopic, DataFormat, TopicDirection} from '../../../../core/models/topic.model';
import {form, FormField, required} from '@angular/forms/signals';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatCard} from '@angular/material/card';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {Device} from '../../../../core/models/device.model';
import {DeviceService} from '../../../../core/services/device.service';

@Component({
  selector: 'app-topic-form',
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    FormField
  ],
  templateUrl: './topic-form.html',
  styleUrl: './topic-form.css',
})
export class TopicForm implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private topicService = inject(TopicService);
  private deviceService = inject(DeviceService);
  private snack = inject(MatSnackBar);

  protected topicModel = signal<CreateTopic>({
    name: '',
    topicPath: '',
    description: '',
    direction: TopicDirection.Incoming,
    dataFormat: DataFormat.Json,
    deviceId: 0,
  });
  isEditMode = signal(false);
  id = signal<number | null>(null);
  devices: Device[] = [];
  selectedDirection = null;
  selectedFormat = null;
  selectedDevice = null;

  ngOnInit(): void {

    this.deviceService.getDevices().subscribe(d =>
      this.devices = d
    );

    const paramId = this.route.snapshot.paramMap.get('id');

    if (paramId) {
      this.id.set(+paramId);
      this.isEditMode.set(true);

      this.topicService.getTopic(+paramId).subscribe(data => {
        this.topicModel.set({
          name: data.name,
          topicPath: data.topicPath,
          description: data.description ?? '',
          direction: data.direction,
          dataFormat: data.dataFormat,
          deviceId: data.deviceId,
        });
      });
    }
  }

  topicForm = form(this.topicModel, (schemaPath) => {
    required(schemaPath.name, {message: 'Name is required'});
    required(schemaPath.topicPath, {message: 'Topic path is required'});
    required(schemaPath.direction, {message: 'Direction is required'});
    required(schemaPath.dataFormat, {message: 'Data format is required'});
    required(schemaPath.deviceId, {message: 'Device is required'});
  });

  cancel() : void {
    this.router.navigate(['/topics']);
  }

  submit() {
    if (this.topicForm().invalid()) {
      alert("Make sure to fill in all the fields correctly.");
      return;
    }

    if (this.isEditMode()) {
      this.update();
    } else {
      this.create();
    }
  }

  update() {
    this.topicService.updateTopic(this.id()!, this.topicModel()).subscribe({
      next: () => {
        this.snack.open('Topic updated.', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/topics']);
      },
      error: (err: any) => {
        console.error('Error updating topic:', err);

        this.snack.open('Failed to update topic. Please try again.', 'Dismiss', { duration: 3000 });
      }
    });
  }

  create() {
    this.topicService.createTopic(this.topicModel()).subscribe({
      next: () => {
        this.snack.open('Topic created.', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/topics']);
      },
      error: (err: any) => {
        console.error('Error creating topic:', err);
        this.snack.open('Failed to create topic. Please try again.', 'Dismiss', { duration: 3000 });
      }
    });
  }
}
