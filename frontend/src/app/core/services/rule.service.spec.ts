import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {RuleService} from './rule.service';
import {ConditionOperator, CreateRuleModel, RuleModel} from '../models/rule.model';
import {TablePageModel} from '../models/table-page.model';

const MOCK_RULE: RuleModel = {
  id: 1,
  name: 'Temp Alert',
  description: 'Alerts when temperature is high',
  isActive: true,
  createdAt: '2026-01-01T00:00:00',
  conditionTopicId: 10,
  conditionTopicName: 'sensor/temp',
  conditionTopicPath: 'sensor/temp',
  operator: ConditionOperator.GreaterThan,
  conditionValue: '30',
  actionTopicId: 20,
  actionTopicName: 'alert/out',
  actionTopicPath: 'alert/out',
  actionField: 'level',
  actionValue: 'high',
};

const MOCK_CREATE_DTO: CreateRuleModel = {
  name: 'New Rule',
  description: '',
  isActive: true,
  conditionField: 'temp',
  operator: ConditionOperator.GreaterThan,
  conditionValue: '30',
  conditionTopicId: 10,
  actionField: 'level',
  actionValue: 'high',
  actionTopicId: 20,
  elseActionTopicId: null,
  elseActionField: '',
  elseActionValue: '',
};

describe('RuleService', () => {
  let service: RuleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        RuleService,
      ],
    });

    service = TestBed.inject(RuleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getRules should GET /rules and return rule array', () => {
    // arrange
    const mockRules = [MOCK_RULE];

    // act
    service.getRules().subscribe(rules => {
      // Assert
      expect(rules).toEqual(mockRules);
    });

    httpMock.expectOne(`${service['apiUrl']}/rules`).flush(mockRules);
  });

  it('getRule should GET /rules/:id', () => {
    // act
    service.getRule(1).subscribe(rule => {
      // Assert
      expect(rule).toEqual(MOCK_RULE);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/rules/1`);
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_RULE);
  });

  it('createRule should POST /rules with the DTO body', () => {
    // arrange
    const mockResponse = { ...MOCK_RULE, id: 99 };

    // act
    service.createRule(MOCK_CREATE_DTO).subscribe(rule => {
      // Assert
      expect(rule.id).toBe(99);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/rules`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(MOCK_CREATE_DTO);
    req.flush(mockResponse);
  });

  it('updateRule should PUT /rules/:id with the DTO body', () => {
    // act
    service.updateRule(5, MOCK_CREATE_DTO).subscribe(rule => {
      expect(rule).toBeDefined();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/rules/5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(MOCK_CREATE_DTO);
    req.flush({ ...MOCK_RULE, id: 5 });
  });

  it('deleteRule should DELETE /rules/:id', () => {
    // act
    service.deleteRule(3).subscribe();

    const req = httpMock.expectOne(`${service['apiUrl']}/rules/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getRulesPage should GET /rules/page with all query params', () => {
    // arrange
    const tablePage: TablePageModel = {
      pageNumber: 1,
      pageSize: 20,
      sortingField: 'name',
      sortingOrder: 'asc',
      filterQuery: 'alert',
      totalItems: 0,
    };
    const mockPage = { total: 10, data: [MOCK_RULE] };

    // act
    service.getRulesPage(tablePage).subscribe(page => {
      // Assert
      expect(page.total).toBe(10);
      expect(page.data.length).toBe(1);
    });

    const req = httpMock.expectOne(r => r.url.endsWith('/rules/page'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('pageSize')).toBe('20');
    expect(req.request.params.get('pageNumber')).toBe('1');
    expect(req.request.params.get('sortingField')).toBe('name');
    expect(req.request.params.get('sortingOrder')).toBe('asc');
    expect(req.request.params.get('filterQuery')).toBe('alert');
    req.flush(mockPage);
  });

  it('getRulesPage should omit filterQuery param when it is empty', () => {
    // arrange
    const tablePage: TablePageModel = {
      pageNumber: 0,
      pageSize: 10,
      sortingField: 'id',
      sortingOrder: 'desc',
      filterQuery: '',
      totalItems: 0,
    };

    // act
    service.getRulesPage(tablePage).subscribe();

    const req = httpMock.expectOne(r => r.url.endsWith('/rules/page'));
    expect(req.request.params.has('filterQuery')).toBe(false);
    req.flush({ total: 0, data: [] });
  });
});
