import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {of} from 'rxjs';
import {DeviceList} from './device-list';
import {DeviceService} from '../../../../core/services/device.service';
import {MatDialog} from '@angular/material/dialog';

const MOCK_DEVICES_PAGE = {
  total: 2,
  data: [
    { id: 1, name: 'Device A', description: 'Sensor device', mqttConnectionId: 1, connectionName: 'Home', createdAt: '2026-01-01T00:00:00' },
    { id: 2, name: 'Device B', description: 'actuator device', mqttConnectionId: 1, connectionName: 'Home', createdAt: '2026-01-02T00:00:00' },
  ],
};

describe('DeviceList', () => {
  let component: DeviceList;
  let fixture: ComponentFixture<DeviceList>;
  let deviceService: { getDevicesPage: ReturnType<typeof vi.fn>; deleteDevice: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    deviceService = {
      getDevicesPage: vi.fn().mockReturnValue(of(MOCK_DEVICES_PAGE)),
      deleteDevice: vi.fn().mockReturnValue(of(null)),
    };
    dialog = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [DeviceList],
      providers: [
        provideRouter([]),
        { provide: DeviceService, useValue: deviceService },
        { provide: MatDialog, useValue: dialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load devices on init', () => {
    // Assert
    expect(deviceService.getDevicesPage).toHaveBeenCalled();
    expect(component.dataSource.data).toHaveLength(2);
  });

  it('edit() should navigate to the device edit route', () => {
    // arrange
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    // act
    component.edit(1);

    // Assert
    expect(navigateSpy).toHaveBeenCalledWith(['/devices/edit/1']);
  });

  it('showMqttConnection() should navigate to the MQTT connection edit route', () => {
    // arrange
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    // act
    component.showMqttConnection(5);

    // Assert
    expect(navigateSpy).toHaveBeenCalledWith(['/mqttconnections/edit/5']);
  });

  it('delete() should open a confirm dialog', () => {
    // arrange
    const dialogRef = { afterClosed: vi.fn().mockReturnValue(of(false)) };
    dialog.open.mockReturnValue(dialogRef);

    // act
    component.delete(1);

    // Assert
    expect(dialog.open).toHaveBeenCalled();
  });

  it('delete() should call deleteDevice and reload when user confirms', async () => {
    // arrange
    const dialogRef = { afterClosed: vi.fn().mockReturnValue(of(true)) };
    dialog.open.mockReturnValue(dialogRef);

    // act
    component.delete(1);
    await fixture.whenStable();

    // Assert
    expect(deviceService.deleteDevice).toHaveBeenCalledWith(1);
    expect(deviceService.getDevicesPage).toHaveBeenCalledTimes(2); // init + after delete
  });

  it('delete() should NOT call deleteDevice when user cancels', async () => {
    // arrange
    const dialogRef = { afterClosed: vi.fn().mockReturnValue(of(false)) };
    dialog.open.mockReturnValue(dialogRef);

    // act
    component.delete(1);
    await fixture.whenStable();

    // Assert
    expect(deviceService.deleteDevice).not.toHaveBeenCalled();
  });
});
