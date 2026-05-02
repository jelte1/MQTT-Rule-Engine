import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentDataShow } from './sent-data-show';

describe('SentDataShow', () => {
  let component: SentDataShow;
  let fixture: ComponentFixture<SentDataShow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SentDataShow],
    }).compileComponents();

    fixture = TestBed.createComponent(SentDataShow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
