import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryGameRoundComponent } from './summary-game-round.component';

describe('SummaryGameRoundComponent', () => {
  let component: SummaryGameRoundComponent;
  let fixture: ComponentFixture<SummaryGameRoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryGameRoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryGameRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
