import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {SentDataShow} from './sent-data-show';
import {SentDataService} from '../../../../core/services/sent-data.service';
import {SensorDataService} from '../../../../core/services/sensor-data.service';
import {VariableService} from '../../../../core/services/variable.service';

const mockRouter = { navigate: vi.fn().mockResolvedValue(true) };
const mockActivatedRoute = { snapshot: { paramMap: { get: vi.fn().mockReturnValue('1') } } };
const MOCK_SENT_DATA = { id: 1, payload: 'on', status: 'Sent', triggerSensorDataId: null, variableId: null };

const mockSentDataService = { getSentData: vi.fn().mockReturnValue(of(MOCK_SENT_DATA)) };
const mockSensorDataService = { getSensorData: vi.fn().mockReturnValue(of(null)) };
const mockVariableService = { getVariable: vi.fn().mockReturnValue(of(null)) };

describe('SentDataShow', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockSentDataService.getSentData.mockReturnValue(of(MOCK_SENT_DATA));
    await TestBed.configureTestingModule({
      imports: [SentDataShow],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: SentDataService, useValue: mockSentDataService },
        { provide: SensorDataService, useValue: mockSensorDataService },
        { provide: VariableService, useValue: mockVariableService },
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(SentDataShow);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call getSentData on init', async () => {
    const fixture = TestBed.createComponent(SentDataShow);
    await fixture.whenStable();
    expect(mockSentDataService.getSentData).toHaveBeenCalled();
  });

  it('should set sentData after successful load', async () => {
    const fixture = TestBed.createComponent(SentDataShow);
    await fixture.whenStable();
    expect(fixture.componentInstance.sentData()).toEqual(MOCK_SENT_DATA);
  });

  it('on error should navigate away', async () => {
    mockSentDataService.getSentData.mockReturnValue(throwError(() => new Error()));
    const fixture = TestBed.createComponent(SentDataShow);
    await fixture.whenStable();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/sentdata']);
  });
});
