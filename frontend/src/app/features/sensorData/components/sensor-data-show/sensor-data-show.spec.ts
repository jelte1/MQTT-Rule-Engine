import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorDataShow } from './sensor-data-show';

describe('SensorDataShow', () => {
  let component: SensorDataShow;
  let fixture: ComponentFixture<SensorDataShow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorDataShow],
    }).compileComponents();

    fixture = TestBed.createComponent(SensorDataShow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
