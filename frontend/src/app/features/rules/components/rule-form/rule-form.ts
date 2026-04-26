import {Component, HostListener, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RuleService} from '../../../../core/services/rule.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConditionOperator, CreateRuleModel} from '../../../../core/models/rule.model';
import {form, FormField, required} from '@angular/forms/signals';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatCard} from '@angular/material/card';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {TopicModel} from '../../../../core/models/topic.model';
import {TopicService} from '../../../../core/services/topic.service';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {forkJoin, of} from 'rxjs';
import {RULE_OPERATORS} from '../../../../core/constants/constants';

@Component({
  selector: 'app-rule-form',
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatSlideToggle,
    FormField,
    MatProgressSpinner,
  ],
  templateUrl: './rule-form.html',
  styleUrl: './rule-form.css',
})
export class RuleForm implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private ruleService = inject(RuleService);
  private topicService = inject(TopicService);
  private snack = inject(MatSnackBar);

  protected readonly RULE_OPERATORS = RULE_OPERATORS;
  protected ruleModel = signal<CreateRuleModel>({
    name: '',
    description: '',
    isActive: true,
    conditionField: '',
    operator: ConditionOperator.Equal,
    conditionValue: '',
    conditionTopicId: null,
    actionValue: '',
    actionField: '',
    actionTopicId: null,
    elseActionTopicId: null,
    elseActionField: '',
    elseActionValue: '',
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
      rule: paramId ? this.ruleService.getRule(+paramId) : of(null)
    }).subscribe({
      next: ({ topics, rule }) => {
        this.topics = topics;

        if (rule) {
          this.ruleModel.set({
            name: rule.name,
            description: rule.description,
            isActive: rule.isActive,
            conditionField: rule.conditionField ?? '',
            operator: rule.operator,
            conditionValue: rule.conditionValue,
            conditionTopicId: rule.conditionTopicId,
            actionValue: rule.actionValue,
            actionField: rule.actionField,
            actionTopicId: rule.actionTopicId,
            elseActionTopicId: rule.elseActionTopicId ?? 0,
            elseActionField: rule.elseActionField ?? '',
            elseActionValue: rule.elseActionValue ?? '',
          });
        }

        this.loading.set(false);
      },
      error: () => {
        if (paramId) this.router.navigate(['/rules']);
        this.loading.set(false);
      }
    });
  }

  ruleForm = form(this.ruleModel, (schemaPath) => {
    required(schemaPath.name, {message: 'Name is required'});
    required(schemaPath.conditionTopicId, {message: 'Condition topic is required'});
    required(schemaPath.operator, {message: 'Condition operator is required'});
    required(schemaPath.conditionValue, {message: 'Condition value to check is required'});
    required(schemaPath.actionTopicId, {message: 'Action topic is required'});
    required(schemaPath.actionValue, {message: 'Value to publish is required'});
    required(schemaPath.isActive, {message: 'Active is required'});
  });

  cancel() : void {
    this.router.navigate(['/rules']);
  }

  submit() {
    if (this.ruleForm().invalid()) {
      this.snack.open("Make sure to fill in all the fields correctly.", "Dismiss", { duration: 3000 });
      return;
    }

    if (this.isEditMode()) {
      this.update();
    } else {
      this.create();
    }
  }

  update() {
    this.ruleService.updateRule(this.id()!, this.ruleModel()).subscribe({
      next: () => {
        this.snack.open('rule updated.', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/rules']);
      },
      error: (err: any) => {
        console.error('Error updating rule:', err);

        this.snack.open('Failed to update rule. Please try again.', 'Dismiss', { duration: 3000 });
      }
    });
  }

  create() {
    this.ruleService.createRule(this.ruleModel()).subscribe({
      next: () => {
        this.snack.open('rule created.', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/rules']);
      },
      error: (err: any) => {
        console.error('Error creating rule:', err);
        this.snack.open('Failed to create rule. Please try again.', 'Dismiss', { duration: 3000 });
      }
    });
  }
}
