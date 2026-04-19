import { BaseApiService } from './base-api.service';
import { Injectable } from '@angular/core';
import { Rule } from '../models/rule.model';
import { Observable } from 'rxjs';
import { CreateRule } from '../models/rule.model';

@Injectable({ providedIn: 'root' })
export class RuleService extends BaseApiService {
  getRules() : Observable<Rule[]> {
    return this.http.get<Rule[]>(`${this.apiUrl}/rules`);
  }

  getRule(id: number) : Observable<Rule> {
    return this.http.get<Rule>(`${this.apiUrl}/rules/${id}`);
  }

  createRule(dto: CreateRule): Observable<Rule> {
    return this.http.post<Rule>(`${this.apiUrl}/rules`, dto);
  }

  updateRule(id: number, dto: CreateRule): Observable<Rule> {
    return this.http.put<Rule>(`${this.apiUrl}/rules/${id}`, dto);
  }

  deleteRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/rules/${id}`);
  }
}
