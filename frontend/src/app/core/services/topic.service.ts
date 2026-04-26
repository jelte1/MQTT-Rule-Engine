import { BaseApiService } from './base-api.service';
import { Injectable } from '@angular/core';
import { TopicModel } from '../models/topic.model';
import { Observable } from 'rxjs';
import { CreateTopicModel } from '../models/topic.model';

@Injectable({ providedIn: 'root' })
export class TopicService extends BaseApiService {
  getTopics() : Observable<TopicModel[]> {
    return this.http.get<TopicModel[]>(`${this.apiUrl}/topics`);
  }

  getTopic(id: number) : Observable<TopicModel> {
    return this.http.get<TopicModel>(`${this.apiUrl}/topics/${id}`);
  }

  createTopic(dto: CreateTopicModel): Observable<TopicModel> {
    return this.http.post<TopicModel>(`${this.apiUrl}/topics`, dto);
  }

  updateTopic(id: number, dto: CreateTopicModel): Observable<TopicModel> {
    return this.http.put<TopicModel>(`${this.apiUrl}/topics/${id}`, dto);
  }

  deleteTopic(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/topics/${id}`);
  }
}
