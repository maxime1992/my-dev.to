import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  discardPeriodicTasks
} from '@angular/core/testing';
import { EncryptComponent } from './encrypt.component';
import { CommonModule } from '../common/common.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe(`EncryptComponent`, () => {
  let component: EncryptComponent;
  let fixture: ComponentFixture<EncryptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, NoopAnimationsModule],
      declarations: [EncryptComponent]
    }).compileComponents();
  }));

  const setup = () => {
    fixture = TestBed.createComponent(EncryptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it(`should create`, () => {
    setup();
    expect(component).toBeTruthy();
  });

  it(`should encrypt a message and display the encrypted result`, fakeAsync(() => {
    setup();

    const dataEncryptInput = fixture.debugElement.query(
      By.css('*[data-encrypt-input]')
    );

    const dataEncryptedInput = fixture.debugElement.query(
      By.css('*[data-encrypted-input]')
    );

    dataEncryptInput.nativeElement.value = 'Hello this is a top secret message';
    dataEncryptInput.nativeElement.dispatchEvent(new Event('input'));

    tick(10);
    fixture.detectChanges();

    expect(dataEncryptedInput.nativeElement.value).toEqual(
      'coxsd amhr mi i drf qshxkx ibmvhjo'
    );

    discardPeriodicTasks();
  }));
});
