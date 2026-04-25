import {Component, HostListener, inject, OnInit, signal} from '@angular/core';
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
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {forkJoin, of} from 'rxjs';
import {TOPIC_DATA_FORMAT_OPTIONS, TOPIC_DIRECTION_OPTIONS} from '../../../../core/constants/constants';

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
    FormField,
    MatProgressSpinner
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
    deviceId: null,
  });
  protected readonly TOPIC_DIRECTION_OPTIONS = TOPIC_DIRECTION_OPTIONS;
  protected readonly TOPIC_DATA_FORMAT_OPTIONS = TOPIC_DATA_FORMAT_OPTIONS;

  isEditMode = signal(false);
  id = signal<number | null>(null);
  loading = signal(false);

  devices: Device[] = [];

  // quick save the current object when Ctrl+S or Cmd+S is pressed
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 's' && this.isEditMode()) {
      event.preventDefault();
      this.submit();
    }
  }

  ngOnInit(): void {
    this.loading.set(true);

    const paramId = this.route.snapshot.paramMap.get('id');

    if (paramId) {
      this.id.set(+paramId);
      this.isEditMode.set(true);
    }

    forkJoin({
      devices: this.deviceService.getDevices(),
      topic: paramId ? this.topicService.getTopic(+paramId) : of(null)
    }).subscribe({
      next: ({ devices, topic }) => {
        this.devices = devices;

        if (topic) {
          this.topicModel.set({
            name: topic.name,
            topicPath: topic.topicPath,
            description: topic.description ?? '',
            direction: topic.direction,
            dataFormat: topic.dataFormat,
            deviceId: topic.deviceId,
          });
        }

        this.loading.set(false);
      },
      error: () => {
        if (paramId) this.router.navigate(['/topics']);
        this.loading.set(false);
      }
    });
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
      this.snack.open("Make sure to fill in all the fields correctly.", "Dismiss", { duration: 3000 });
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
