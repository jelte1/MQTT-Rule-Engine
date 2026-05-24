import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MqttConnectionForm} from './mqtt-connection-form';
import {MqttConnectionService} from '../../../../core/services/mqtt-connection.service';

const mockRouter = { navigate: vi.fn().mockResolvedValue(true) };
const mockActivatedRoute = { snapshot: { paramMap: { get: vi.fn().mockReturnValue(null) } } };
const mockMqttConnectionService = {
  getMqttConnection: vi.fn().mockReturnValue(of(null)),
  createMqttConnection: vi.fn(),
  updateMqttConnection: vi.fn(),
};
const mockSnack = { open: vi.fn() };

describe('MqttConnectionForm', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [MqttConnectionForm],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MqttConnectionService, useValue: mockMqttConnectionService },
        { provide: MatSnackBar, useValue: mockSnack },
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(MqttConnectionForm);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('isEditMode should be false when no route param', async () => {
    const fixture = TestBed.createComponent(MqttConnectionForm);
    await fixture.whenStable();
    expect(fixture.componentInstance.isEditMode()).toBe(false);
  });

  it('submit() with invalid form should show validation snack', async () => {
    const fixture = TestBed.createComponent(MqttConnectionForm);
    await fixture.whenStable();
    fixture.componentInstance.submit();
    expect(mockSnack.open).toHaveBeenCalledWith(
      expect.stringContaining('fill in all the fields'),
      'Dismiss',
      expect.any(Object)
    );
  });

  it('create() should call mqttConnectionService.createMqttConnection', async () => {
    mockMqttConnectionService.createMqttConnection.mockReturnValue(of({}));
    const fixture = TestBed.createComponent(MqttConnectionForm);
    await fixture.whenStable();
    fixture.componentInstance.create();
    expect(mockMqttConnectionService.createMqttConnection).toHaveBeenCalled();
  });

  it('create() on error should show error snack', async () => {
    mockMqttConnectionService.createMqttConnection.mockReturnValue(throwError(() => new Error()));
    const fixture = TestBed.createComponent(MqttConnectionForm);
    await fixture.whenStable();
    fixture.componentInstance.create();
    expect(mockSnack.open).toHaveBeenCalledWith(
      expect.stringContaining('Failed'),
      'Dismiss',
      expect.any(Object)
    );
  });
});
