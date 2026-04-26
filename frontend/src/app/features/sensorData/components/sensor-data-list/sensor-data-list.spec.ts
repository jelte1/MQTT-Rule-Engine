import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorDataList } from './sensor-data-list';

describe('SensorDataList', () => {
  let component: SensorDataList;
  let fixture: ComponentFixture<SensorDataList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorDataList],
    }).compileComponents();

    fixture = TestBed.createComponent(SensorDataList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
