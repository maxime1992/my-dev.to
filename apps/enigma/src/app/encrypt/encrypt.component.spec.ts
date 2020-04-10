import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '../common/common.module';
import { EncryptComponent } from './encrypt.component';

describe(`EncryptComponent`, () => {
  let component: EncryptComponent;
  let fixture: ComponentFixture<EncryptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, NoopAnimationsModule],
      declarations: [EncryptComponent],
      // can't import the rotors as they use ngx-sub-form which has
      // a dependency on lodash-es and is not happy with Jest here
      // without further setup
      // as we want to test only the encryption part here
      // let's skip the rotors
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
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

    const dataEncryptInput = fixture.debugElement.query(By.css('*[data-encrypt-input]'));

    const dataEncryptedInput = fixture.debugElement.query(By.css('*[data-encrypted-input]'));

    dataEncryptInput.nativeElement.value = 'Hello this is a top secret message';
    dataEncryptInput.nativeElement.dispatchEvent(new Event('input'));

    tick(10);
    fixture.detectChanges();

    expect(dataEncryptedInput.nativeElement.value).toEqual('coxsd amhr mi i drf qshxkx ibmvhjo');

    discardPeriodicTasks();
  }));
});
