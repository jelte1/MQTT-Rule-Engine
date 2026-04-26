import { BaseApiService } from './base-api.service';
import { Injectable } from '@angular/core';
import { RuleModel } from '../models/rule.model';
import { Observable } from 'rxjs';
import { CreateRuleModel } from '../models/rule.model';

@Injectable({ providedIn: 'root' })
export class RuleService extends BaseApiService {
  getRules() : Observable<RuleModel[]> {
    return this.http.get<RuleModel[]>(`${this.apiUrl}/rules`);
  }

  getRule(id: number) : Observable<RuleModel> {
    return this.http.get<RuleModel>(`${this.apiUrl}/rules/${id}`);
  }

  createRule(dto: CreateRuleModel): Observable<RuleModel> {
    return this.http.post<RuleModel>(`${this.apiUrl}/rules`, dto);
  }

  updateRule(id: number, dto: CreateRuleModel): Observable<RuleModel> {
    return this.http.put<RuleModel>(`${this.apiUrl}/rules/${id}`, dto);
  }

  deleteRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/rules/${id}`);
  }
}
