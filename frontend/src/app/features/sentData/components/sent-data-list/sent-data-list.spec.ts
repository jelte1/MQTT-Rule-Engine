import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentDataList } from './sent-data-list';

describe('SentDataList', () => {
  let component: SentDataList;
  let fixture: ComponentFixture<SentDataList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SentDataList],
    }).compileComponents();

    fixture = TestBed.createComponent(SentDataList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
