import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DeviceForm} from './device-form';
import {DeviceService} from '../../../../core/services/device.service';
import {MqttConnectionService} from '../../../../core/services/mqtt-connection.service';

const mockRouter = { navigate: vi.fn().mockResolvedValue(true) };
const mockActivatedRoute = { snapshot: { paramMap: { get: vi.fn().mockReturnValue(null) } } };
const mockDeviceService = {
  getDevice: vi.fn().mockReturnValue(of(null)),
  createDevice: vi.fn(),
  updateDevice: vi.fn(),
};
const mockMqttConnectionService = {
  getMqttConnections: vi.fn().mockReturnValue(of([])),
};
const mockSnack = { open: vi.fn() };

describe('DeviceForm', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockMqttConnectionService.getMqttConnections.mockReturnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [DeviceForm],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: DeviceService, useValue: mockDeviceService },
        { provide: MqttConnectionService, useValue: mockMqttConnectionService },
        { provide: MatSnackBar, useValue: mockSnack },
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(DeviceForm);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load mqtt connections on init', async () => {
    const fixture = TestBed.createComponent(DeviceForm);
    await fixture.whenStable();
    expect(mockMqttConnectionService.getMqttConnections).toHaveBeenCalled();
  });

  it('isEditMode should be false when no route param', async () => {
    const fixture = TestBed.createComponent(DeviceForm);
    await fixture.whenStable();
    expect(fixture.componentInstance.isEditMode()).toBe(false);
  });

  it('create() should call deviceService.createDevice', async () => {
    mockDeviceService.createDevice.mockReturnValue(of({}));
    const fixture = TestBed.createComponent(DeviceForm);
    await fixture.whenStable();
    fixture.componentInstance.create();
    expect(mockDeviceService.createDevice).toHaveBeenCalled();
  });

  it('create() on error should show error snack', async () => {
    mockDeviceService.createDevice.mockReturnValue(throwError(() => new Error()));
    const fixture = TestBed.createComponent(DeviceForm);
    await fixture.whenStable();
    fixture.componentInstance.create();
    expect(mockSnack.open).toHaveBeenCalledWith(
      expect.stringContaining('Failed'),
      'Dismiss',
      expect.any(Object)
    );
  });
});
