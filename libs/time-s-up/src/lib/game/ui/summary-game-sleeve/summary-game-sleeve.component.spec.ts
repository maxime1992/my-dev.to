import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryGameSleeveComponent } from './summary-game-sleeve.component';

describe('SummaryGameSleeveComponent', () => {
  let component: SummaryGameSleeveComponent;
  let fixture: ComponentFixture<SummaryGameSleeveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SummaryGameSleeveComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryGameSleeveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
