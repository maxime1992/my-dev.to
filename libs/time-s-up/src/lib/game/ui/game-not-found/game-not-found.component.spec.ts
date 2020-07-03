import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameNotFoundComponent } from './game-not-found.component';

describe('GameNotFoundComponent', () => {
  let component: GameNotFoundComponent;
  let fixture: ComponentFixture<GameNotFoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameNotFoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
