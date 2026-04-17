import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RuleService} from '../../../../core/services/rule.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConditionOperator, CreateRule} from '../../../../core/models/rule.model';
import {form, FormField, required} from '@angular/forms/signals';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatCard} from '@angular/material/card';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {Topic} from '../../../../core/models/topic.model';
import {TopicService} from '../../../../core/services/topic.service';

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

  protected ruleModel = signal<CreateRule>({
    name: '',
    description: '',
    isActive: true,
    conditionField: '',
    operator: ConditionOperator.Equal,
    conditionValue: '',
    conditionTopicId: 0,
    actionValue: '',
    actionField: '',
    actionTopicId: 0
  });
  isEditMode = signal(false);
  id = signal<number | null>(null);
  topics: Topic[] = [];
  selectedDirection = null;
  selectedFormat = null;
  selectedDevice = null;

  ngOnInit(): void {

    this.topicService.getTopics().subscribe(d =>
      this.topics = d
    );

    const paramId = this.route.snapshot.paramMap.get('id');

    if (paramId) {
      this.id.set(+paramId);
      this.isEditMode.set(true);

      this.ruleService.getRule(+paramId).subscribe(data => {
        this.ruleModel.set({
          name: data.name,
          description: data.description,
          isActive: data.isActive,
          conditionField: data.conditionField ?? '',
          operator: data.operator,
          conditionValue: data.conditionValue,
          conditionTopicId: data.conditionTopicId,
          actionValue: data.actionValue,
          actionField: data.actionField,
          actionTopicId: data.actionTopicId,
        });
      });
    }
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
