import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DeviceService} from '../../../../core/services/device.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CreateDevice} from '../../../../core/models/device.model';
import {form, FormField, required} from '@angular/forms/signals';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatCard} from '@angular/material/card';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MqttConnection} from '../../../../core/models/mqtt-connection.model';
import {MqttConnectionService} from '../../../../core/services/mqtt-connection.service';

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
    MatOption
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

  protected deviceModel = signal<CreateDevice>({
    name: '',
    description: '',
    mqttConnectionId: 0,
  });
  isEditMode = signal(false);
  id = signal<number | null>(null);
  mqttConnections: MqttConnection[] = [];
  selected = null;

  ngOnInit(): void {

    this.mqttConnectionService.getMqttConnections().subscribe(c =>
      this.mqttConnections = c
    );

    const paramId = this.route.snapshot.paramMap.get('id');

    if (paramId) {
      this.id.set(+paramId);
      this.isEditMode.set(true);

      this.deviceService.getDevice(+paramId).subscribe(data => {
        this.deviceModel.set({
          name: data.name,
          description: data.description ?? '',
          mqttConnectionId: data.mqttConnectionId,
        });
      });
    }
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

