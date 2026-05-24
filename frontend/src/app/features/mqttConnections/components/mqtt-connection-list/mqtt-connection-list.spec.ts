import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {of} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {MqttConnectionList} from './mqtt-connection-list';
import {MqttConnectionService} from '../../../../core/services/mqtt-connection.service';

const MOCK_PAGE = { data: [{ id: 1, name: 'Broker 1', host: 'localhost', isActive: true }], total: 1 };

const mockMqttConnectionService = {
  getMqttConnectionPage: vi.fn().mockReturnValue(of(MOCK_PAGE)),
  deleteMqttConnection: vi.fn().mockReturnValue(of({})),
  reconnectMqttConnection: vi.fn().mockReturnValue(of({})),
};
const mockSnack = { open: vi.fn() };
const mockDialog = { open: vi.fn() };

describe('MqttConnectionList', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockMqttConnectionService.getMqttConnectionPage.mockReturnValue(of(MOCK_PAGE));
    await TestBed.configureTestingModule({
      imports: [MqttConnectionList],
      providers: [
        provideRouter([]),
        { provide: MqttConnectionService, useValue: mockMqttConnectionService },
        { provide: MatSnackBar, useValue: mockSnack },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(MqttConnectionList);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load connections on init', async () => {
    const fixture = TestBed.createComponent(MqttConnectionList);
    await fixture.whenStable();
    expect(mockMqttConnectionService.getMqttConnectionPage).toHaveBeenCalled();
  });

  it('should fill dataSource after load', async () => {
    const fixture = TestBed.createComponent(MqttConnectionList);
    await fixture.whenStable();
    expect(fixture.componentInstance.dataSource.data).toHaveLength(1);
  });

  it('delete() should open confirm dialog', async () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of(false) });
    const fixture = TestBed.createComponent(MqttConnectionList);
    await fixture.whenStable();
    fixture.componentInstance.delete(1);
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('delete() confirmed should call deleteMqttConnection', async () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of(true) });
    const fixture = TestBed.createComponent(MqttConnectionList);
    await fixture.whenStable();
    fixture.componentInstance.delete(1);
    expect(mockMqttConnectionService.deleteMqttConnection).toHaveBeenCalledWith(1);
  });
});
