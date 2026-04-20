import {Component, inject, OnInit, signal} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {Router, ActivatedRoute } from '@angular/router';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatCard} from '@angular/material/card';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {FormField, required} from '@angular/forms/signals';
import {MqttConnectionService} from '../../../../core/services/mqtt-connection.service';
import {CreateMqttConnection} from '../../../../core/models/mqtt-connection.model';
import {form} from '@angular/forms/signals';
import {FormsModule} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-mqtt-connection-form',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatCard,
    MatSlideToggle,
    MatButton,
    FormField,
    FormsModule
  ],
  templateUrl: './mqtt-connection-form.html',
  styleUrl: './mqtt-connection-form.css',
})

export class MqttConnectionForm implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private mqttConnectionService = inject(MqttConnectionService);
  private snack = inject(MatSnackBar);

  protected mqttConnectionModel = signal<CreateMqttConnection>({
    name: '',
    host: '',
    port: 1883,
    username: '',
    password: '',
    clientId: '',
    useTls: false,
    isActive: true
  });
  isEditMode = signal(false);
  id = signal<number | null>(null);

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');

    if (paramId) {
      this.id.set(+paramId);
      this.isEditMode.set(true);

      this.mqttConnectionService.getMqttConnection(+paramId).subscribe({
        next: data => {
          this.mqttConnectionModel.set({
            name: data.name,
            host: data.host,
            port: data.port,
            username: data.username ?? '',
            clientId: data.clientId ?? '',
            useTls: data.useTls,
            isActive: data.isActive,
            password: ''
          });
        },
        error: () => {
          this.router.navigate(['/mqttconnections']);
        }
      });
    }

  }

  mqttConnectionForm = form(this.mqttConnectionModel, (schemaPath) => {
    required(schemaPath.name, {message: 'Name is required'});
    required(schemaPath.host, {message: 'Host is required'});
    required(schemaPath.port, {message: 'Port is required'});
  });

  cancel() : void {
    this.router.navigate(['/mqttconnections']);
  }

  submit() {
    if (this.mqttConnectionForm().invalid()) {
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
    this.mqttConnectionService.updateMqttConnection(this.id()!, this.mqttConnectionModel()).subscribe({
      next: () => {
        this.snack.open('MQTT Connection updated.', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/mqttconnections']);
      },
      error: (err: any) => {
        console.error('Error updating MQTT Connection:', err);
        this.snack.open('Failed to update MQTT Connection. Please try again.', 'Dismiss', { duration: 3000 });
      }
    });
  }

  create() {
    this.mqttConnectionService.createMqttConnection(this.mqttConnectionModel()).subscribe({
      next: () => {
        this.snack.open('MQTT Connection created.', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/mqttconnections']);
      },
      error: (err: any) => {
        console.error('Error creating MQTT Connection:', err);
        this.snack.open('Failed to create MQTT Connection. Please try again.', 'Dismiss', { duration: 3000 });
      }
    });
  }
}
