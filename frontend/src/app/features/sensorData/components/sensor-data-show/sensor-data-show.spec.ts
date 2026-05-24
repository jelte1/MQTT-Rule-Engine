import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {SensorDataShow} from './sensor-data-show';
import {SensorDataService} from '../../../../core/services/sensor-data.service';
import {SentDataService} from '../../../../core/services/sent-data.service';

const mockRouter = { navigate: vi.fn().mockResolvedValue(true) };
const mockActivatedRoute = { snapshot: { paramMap: { get: vi.fn().mockReturnValue('1') } } };
const MOCK_SENSOR_DATA = { id: 1, value: '23.5', topicPath: 'sensor/temp', receivedAt: '2025-01-01T00:00:00Z' };

const mockSensorDataService = { getSensorData: vi.fn().mockReturnValue(of(MOCK_SENSOR_DATA)) };
const mockSentDataService = { getSentDataBySensorId: vi.fn().mockReturnValue(of([])) };

describe('SensorDataShow', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockSensorDataService.getSensorData.mockReturnValue(of(MOCK_SENSOR_DATA));
    mockSentDataService.getSentDataBySensorId.mockReturnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [SensorDataShow],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: SensorDataService, useValue: mockSensorDataService },
        { provide: SentDataService, useValue: mockSentDataService },
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(SensorDataShow);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call getSensorData on init', async () => {
    const fixture = TestBed.createComponent(SensorDataShow);
    await fixture.whenStable();
    expect(mockSensorDataService.getSensorData).toHaveBeenCalled();
  });

  it('should set sensorData after successful load', async () => {
    const fixture = TestBed.createComponent(SensorDataShow);
    await fixture.whenStable();
    expect(fixture.componentInstance.sensorData()).toEqual(MOCK_SENSOR_DATA);
  });

  it('on error should navigate away', async () => {
    mockSensorDataService.getSensorData.mockReturnValue(throwError(() => new Error()));
    mockSentDataService.getSentDataBySensorId.mockReturnValue(throwError(() => new Error()));
    const fixture = TestBed.createComponent(SensorDataShow);
    await fixture.whenStable();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/sensordata']);
  });
});
