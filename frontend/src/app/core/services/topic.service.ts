import { BaseApiService } from './base-api.service';
import { Injectable } from '@angular/core';
import { Topic } from '../models/topic.model';
import { Observable } from 'rxjs';
import { CreateTopic } from '../models/topic.model';

@Injectable({ providedIn: 'root' })
export class TopicService extends BaseApiService {
  getTopics() : Observable<Topic[]> {
    return this.http.get<Topic[]>(`${this.apiUrl}/topics`);
  }

  getTopic(id: number) : Observable<Topic> {
    return this.http.get<Topic>(`${this.apiUrl}/topics/${id}`);
  }

  createTopic(dto: CreateTopic): Observable<Topic> {
    console.log(dto);
    return this.http.post<Topic>(`${this.apiUrl}/topics`, dto);
  }

  updateTopic(id: number, dto: CreateTopic): Observable<Topic> {
    return this.http.put<Topic>(`${this.apiUrl}/topics/${id}`, dto);
  }

  deleteTopic(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/topics/${id}`);
  }
}
