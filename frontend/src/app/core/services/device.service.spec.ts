import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {DeviceService} from './device.service';
import {CreateDeviceModel, DeviceModel} from '../models/device.model';
import {TablePageModel} from '../models/table-page.model';

const MOCK_DEVICE: DeviceModel = {
  id: 1,
  name: 'Sensor Device',
  description: 'Living room sensor',
  mqttConnectionId: 5,
  connectionName: 'Home Broker',
  createdAt: '2026-01-01T00:00:00',
};

const MOCK_CREATE_DTO: CreateDeviceModel = {
  name: 'NewDevice',
  description: 'A new device',
  mqttConnectionId: 5,
};

describe('DeviceService', () => {
  let service: DeviceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        DeviceService,
      ],
    });

    service = TestBed.inject(DeviceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getDevices should GET /devices', () => {
    // arrange
    const mockDevices = [MOCK_DEVICE];

    // act
    service.getDevices().subscribe(devices => {
      // Assert
      expect(devices).toEqual(mockDevices);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/devices`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDevices);
  });

  it('getDevice should GET /devices/:id', () => {
    // act
    service.getDevice(1).subscribe(device => {
      // Assert
      expect(device).toEqual(MOCK_DEVICE);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/devices/1`);
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_DEVICE);
  });

  it('createDevice should POST /devices with the DTO', () => {
    // arrange
    const response = { ...MOCK_DEVICE, id: 42, name: 'NewDevice' };

    // act
    service.createDevice(MOCK_CREATE_DTO).subscribe(device => {
      // Assert
      expect(device.id).toBe(42);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/devices`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(MOCK_CREATE_DTO);
    req.flush(response);
  });

  it('updateDevice should PUT /devices/:id with the DTO', () => {
    // arrange
    const response = { ...MOCK_DEVICE, name: 'UpdatedDevice' };

    // act
    service.updateDevice(1, MOCK_CREATE_DTO).subscribe(device => {
      // Assert
      expect(device.name).toBe('UpdatedDevice');
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/devices/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(MOCK_CREATE_DTO);
    req.flush(response);
  });

  it('deleteDevice should DELETE /devices/:id', () => {
    // act
    service.deleteDevice(7).subscribe();

    const req = httpMock.expectOne(`${service['apiUrl']}/devices/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getDevicesPage should GET /devices/page with correct params', () => {
    // arrange
    const tablePage: TablePageModel = {
      pageNumber: 0,
      pageSize: 10,
      sortingField: 'name',
      sortingOrder: 'asc',
      filterQuery: 'sensor',
      totalItems: 0,
    };
    const mockPage = { total: 1, data: [MOCK_DEVICE] };

    // act
    service.getDevicesPage(tablePage).subscribe(page => {
      // Assert
      expect(page.data).toHaveLength(1);
      expect(page.total).toBe(1);
    });

    const req = httpMock.expectOne(r => r.url.endsWith('/devices/page'));
    expect(req.request.params.get('pageSize')).toBe('10');
    expect(req.request.params.get('pageNumber')).toBe('0');
    expect(req.request.params.get('filterQuery')).toBe('sensor');
    expect(req.request.params.get('sortingField')).toBe('name');
    expect(req.request.params.get('sortingOrder')).toBe('asc');
    req.flush(mockPage);
  });
});
