import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {of} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {TopicList} from './topic-list';
import {TopicService} from '../../../../core/services/topic.service';

const MOCK_PAGE = { data: [{ id: 1, name: 'Temperature', topicPath: 'sensor/temp', deviceName: 'Device A' }], total: 1 };

const mockTopicService = {
  getTopicsPage: vi.fn().mockReturnValue(of(MOCK_PAGE)),
  deleteTopic: vi.fn().mockReturnValue(of({})),
};
const mockDialog = { open: vi.fn() };

describe('TopicList', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockTopicService.getTopicsPage.mockReturnValue(of(MOCK_PAGE));
    await TestBed.configureTestingModule({
      imports: [TopicList],
      providers: [
        provideRouter([]),
        { provide: TopicService, useValue: mockTopicService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(TopicList);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load topics on init', async () => {
    const fixture = TestBed.createComponent(TopicList);
    await fixture.whenStable();
    expect(mockTopicService.getTopicsPage).toHaveBeenCalled();
  });

  it('should fill dataSource after load', async () => {
    const fixture = TestBed.createComponent(TopicList);
    await fixture.whenStable();
    expect(fixture.componentInstance.dataSource.data).toHaveLength(1);
  });

  it('delete() should open confirm dialog', async () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of(false) });
    const fixture = TestBed.createComponent(TopicList);
    await fixture.whenStable();
    fixture.componentInstance.delete(1);
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('delete() confirmed should call deleteTopic', async () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of(true) });
    const fixture = TestBed.createComponent(TopicList);
    await fixture.whenStable();
    fixture.componentInstance.delete(1);
    expect(mockTopicService.deleteTopic).toHaveBeenCalledWith(1);
  });
});
