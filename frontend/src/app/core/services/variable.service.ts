import {Injectable} from '@angular/core';
import {BaseApiService} from './base-api.service';
import {Observable} from 'rxjs';
import {PageModel, TablePageModel} from '../models/table-page.model';
import {CreateVariableModel, VariableModel} from '../models/variable.model';

@Injectable({ providedIn: 'root' })
export class VariableService extends BaseApiService {
  getVariables() : Observable<VariableModel[]> {
    return this.http.get<VariableModel[]>(`${this.apiUrl}/variables`);
  }

  getVariable(id: number) : Observable<VariableModel> {
    return this.http.get<VariableModel>(`${this.apiUrl}/variables/${id}`);
  }

  createVariable(dto: CreateVariableModel): Observable<VariableModel> {
    return this.http.post<VariableModel>(`${this.apiUrl}/variables`, dto);
  }

  updateVariable(id: number, dto: CreateVariableModel): Observable<VariableModel> {
    return this.http.put<VariableModel>(`${this.apiUrl}/variables/${id}`, dto);
  }

  deleteVariable(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/variables/${id}`);
  }

  getVariablesPage(tablePage: TablePageModel): Observable<PageModel<VariableModel>> {
    return this.getPage<PageModel<VariableModel>>('variables', tablePage);
  }

  resendVariable(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/variables/${id}/resend`, null);
  }
}
