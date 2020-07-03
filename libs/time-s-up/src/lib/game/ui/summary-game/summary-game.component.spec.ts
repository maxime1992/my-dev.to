import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryGameComponent } from './summary-game.component';

describe('SummaryGameComponent', () => {
  let component: SummaryGameComponent;
  let fixture: ComponentFixture<SummaryGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
