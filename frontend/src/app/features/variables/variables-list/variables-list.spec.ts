import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariablesList } from './variables-list';

describe('VariablesList', () => {
  let component: VariablesList;
  let fixture: ComponentFixture<VariablesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariablesList],
    }).compileComponents();

    fixture = TestBed.createComponent(VariablesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
