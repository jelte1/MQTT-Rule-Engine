import {Component, inject, signal} from '@angular/core';
import {TopicService} from '../../../../core/services/topic.service';
import {Router, RouterLink} from '@angular/router';
import {Topic} from '../../../../core/models/topic.model';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent} from '@angular/material/card';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from '@angular/material/table';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-topic-list',
  imports: [
    MatButton,
    MatCard,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatIconButton,
    MatProgressSpinner,
    MatRow,
    MatRowDef,
    MatTable,
    MatTooltip,
    RouterLink,
    MatHeaderCellDef,
    MatCardContent
  ],
  templateUrl: './topic-list.html',
  styleUrl: './topic-list.css',
})
export class TopicList {
  private topicService = inject(TopicService);
  private router = inject(Router);

  topics = signal<Topic[]>([]);
  loading = signal(false);
  displayedColumns: string[] = ['name', 'topicPath', 'description', 'deviceName', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);

    this.topicService.getTopics().subscribe({
      next: topics => {
        this.topics.set(topics);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  edit(id: number): void {
    this.router.navigate([`/topics/edit/${id}`]);
  }

  delete(id: number): void {
    this.topicService.deleteTopic(id).subscribe({
      next: topics => {
        this.load();
      }
    });
  }
}
