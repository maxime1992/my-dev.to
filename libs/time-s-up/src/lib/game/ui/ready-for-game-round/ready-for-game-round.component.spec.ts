import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadyForGameRoundComponent } from './ready-for-game-round.component';

describe('ReadyForGameRoundComponent', () => {
  let component: ReadyForGameRoundComponent;
  let fixture: ComponentFixture<ReadyForGameRoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReadyForGameRoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadyForGameRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
