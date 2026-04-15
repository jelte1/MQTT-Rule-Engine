import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MqttConnectionList } from './mqtt-connection-list';

describe('MqttConnectionList', () => {
  let component: MqttConnectionList;
  let fixture: ComponentFixture<MqttConnectionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MqttConnectionList],
    }).compileComponents();

    fixture = TestBed.createComponent(MqttConnectionList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
