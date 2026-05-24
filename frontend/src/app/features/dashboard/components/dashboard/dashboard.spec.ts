import {TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {EMPTY, of, throwError} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Dashboard} from './dashboard';
import {SensorDataService} from '../../../../core/services/sensor-data.service';
import {SignalrService} from '../../../../core/services/signalr.service';

const mockRouter = { navigate: vi.fn().mockResolvedValue(true) };
const mockSensorDataService = {
  getLatestSensorData: vi.fn().mockReturnValue(of([])),
};
const mockSignalrService = {
  startConnection: vi.fn(),
  stopConnection: vi.fn().mockResolvedValue(undefined),
  sensorData$: EMPTY,
};
const mockSnack = { open: vi.fn() };

describe('Dashboard', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockSensorDataService.getLatestSensorData.mockReturnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: SensorDataService, useValue: mockSensorDataService },
        { provide: SignalrService, useValue: mockSignalrService },
        { provide: MatSnackBar, useValue: mockSnack },
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call getLatestSensorData oninit', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    expect(mockSensorDataService.getLatestSensorData).toHaveBeenCalledWith(10);
  });

  it('should start SignalR connection oninit', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    expect(mockSignalrService.startConnection).toHaveBeenCalled();
  });

  it('load() on error should show msg', async () => {
    mockSensorDataService.getLatestSensorData.mockReturnValue(throwError(() => new Error()));
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    expect(mockSnack.open).toHaveBeenCalledWith(
      expect.stringContaining('Failed'),
      'Dismiss',
      expect.any(Object)
    );
  });
});
