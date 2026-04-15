import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MqttConnectionForm } from './mqtt-connection-form';

describe('MqttConnectionForm', () => {
  let component: MqttConnectionForm;
  let fixture: ComponentFixture<MqttConnectionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MqttConnectionForm],
    }).compileComponents();

    fixture = TestBed.createComponent(MqttConnectionForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
