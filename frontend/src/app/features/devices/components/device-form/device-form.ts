import {Component, HostListener, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DeviceService} from '../../../../core/services/device.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CreateDeviceModel} from '../../../../core/models/device.model';
import {form, FormField, required} from '@angular/forms/signals';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatCard} from '@angular/material/card';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MqttConnectionModel} from '../../../../core/models/mqtt-connection.model';
import {MqttConnectionService} from '../../../../core/services/mqtt-connection.service';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {forkJoin, of} from 'rxjs';

@Component({
  selector: 'app-device-form',
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    FormField,
    MatSelect,
    MatOption,
    MatProgressSpinner
  ],
  templateUrl: './device-form.html',
  styleUrl: './device-form.css',
})

export class DeviceForm implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private deviceService = inject(DeviceService);
  private mqttConnectionService = inject(MqttConnectionService);
  private snack = inject(MatSnackBar);

  protected deviceModel = signal<CreateDeviceModel>({
    name: '',
    description: '',
    mqttConnectionId: null,
  });
  isEditMode = signal(false);
  id = signal<number | null>(null);
  loading = signal(false);
  mqttConnections: MqttConnectionModel[] = [];

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
      connections: this.mqttConnectionService.getMqttConnections(),
      device: paramId ? this.deviceService.getDevice(+paramId) : of(null)
    }).subscribe({
      next: ({ connections, device }) => {
        this.mqttConnections = connections;

        if (device) {
          this.deviceModel.set({
            name: device.name,
            description: device.description ?? '',
            mqttConnectionId: device.mqttConnectionId,
          });
        }

        this.loading.set(false);
      },
      error: () => {
        if (paramId) this.router.navigate(['/devices']);
        this.loading.set(false);
      }
    });
  }

  deviceForm = form(this.deviceModel, (schemaPath) => {
    required(schemaPath.name, {message: 'Name is required'});
    required(schemaPath.mqttConnectionId, {message: 'Mqtt Connection is required'});
  });

  cancel() : void {
    this.router.navigate(['/devices']);
  }

  submit() {
    if (this.deviceForm().invalid()) {
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
    this.deviceService.updateDevice(this.id()!, this.deviceModel()).subscribe({
      next: () => {
        this.snack.open('Device updated.', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/devices']);
      },
      error: (err: any) => {
        console.error('Error updating Device:', err);

        this.snack.open('Failed to update Device. Please try again.', 'Dismiss', { duration: 3000 });
      }
    });
  }

  create() {
    this.deviceService.createDevice(this.deviceModel()).subscribe({
      next: () => {
        this.snack.open('Device created.', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/devices']);
      },
      error: (err: any) => {
        console.error('Error creating Device:', err);
        this.snack.open('Failed to create Device. Please try again.', 'Dismiss', { duration: 3000 });
      }
    });
  }
}

