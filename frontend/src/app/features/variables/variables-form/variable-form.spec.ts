import {ComponentFixture, TestBed} from '@angular/core/testing';

import {VariableForm} from './variable-form';

describe('VariablesForm', () => {
  let component: VariableForm;
  let fixture: ComponentFixture<VariableForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariableForm],
    }).compileComponents();

    fixture = TestBed.createComponent(VariableForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
