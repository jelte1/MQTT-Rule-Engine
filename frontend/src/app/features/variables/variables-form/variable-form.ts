import {Component, HostListener, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {forkJoin, of} from 'rxjs';
import {form, FormField, required} from '@angular/forms/signals';
import {VariableService} from '../../../core/services/variable.service';
import {CreateVariableModel} from '../../../core/models/variable.model';
import {TopicModel} from '../../../core/models/topic.model';
import {TopicService} from '../../../core/services/topic.service';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatCard} from '@angular/material/card';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'app-variables-form',
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    MatProgressSpinner,
    MatSelect,
    FormField
  ],
  templateUrl: './variable-form.html',
  styleUrl: './variable-form.css',
})
export class VariableForm implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private variableService = inject(VariableService);
  private topicService = inject(TopicService);
  private snack = inject(MatSnackBar);

  protected variableModel = signal<CreateVariableModel>({
    name: '',
    description: '',
    topicId: null,
    field: '',
    value: '',
  });
  isEditMode = signal(false);
  id = signal<number | null>(null);
  loading = signal(false);
  topics: TopicModel[] = [];

  // quick save the current object when Ctrl+S or Cmd+S is pressed
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 's' && this.isEditMode()) {
      event.preventDefault();
      this.submit();
    }
  }

  ngOnInit(): void {
    this.loading.set(true);

    const paramId = this.route.snapshot.paramMap.get('id');

    if (paramId) {
      this.id.set(+paramId);
      this.isEditMode.set(true);
    }

    forkJoin({
      topics: this.topicService.getTopics(),
      variable: paramId ? this.variableService.getVariable(+paramId) : of(null)
    }).subscribe({
      next: ({ topics, variable }) => {
        this.topics = topics;

        if (variable) {
          this.variableModel.set({
            name: variable.name,
            description: variable.description ?? '',
            topicId: variable.topicId,
            field: variable.field ?? '',
            value: variable.value,
          });
        }

        this.loading.set(false);
      },
      error: () => {
        if (paramId) this.router.navigate(['/variables']);
        this.loading.set(false);
      }
    });
  }

  variableForm = form(this.variableModel, (schemaPath) => {
    required(schemaPath.name, {message: 'Name is required'});
    required(schemaPath.value, {message: 'Value is required'});
    required(schemaPath.topicId, {message: 'Topic is required'});
  });

  cancel() : void {
    this.router.navigate(['/variables']);
  }

  submit() {
    if (this.variableForm().invalid()) {
      alert("Make sure to fill in all the fields correctly.");
      return;
    }

    if (this.isEditMode()) {
      this.update();
    } else {
      this.create();
    }
  }

  update() {
    this.variableService.updateVariable(this.id()!, this.variableModel()).subscribe({
      next: () => {
        this.snack.open('Variable updated.', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/variables']);
      },
      error: (err: any) => {
        console.error('Error updating Variable:', err);

        this.snack.open('Failed to update Variable. Please try again.', 'Dismiss', { duration: 3000 });
      }
    });
  }

  create() {
    this.variableService.createVariable(this.variableModel()).subscribe({
      next: () => {
        this.snack.open('Variable created.', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/variables']);
      },
      error: (err: any) => {
        console.error('Error creating Variable:', err);
        this.snack.open('Failed to create Variable. Please try again.', 'Dismiss', { duration: 3000 });
      }
    });
  }
}
