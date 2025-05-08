import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeNavigationComponent } from './time-navigation.component';

describe('TimeNavigationComponent', () => {
  let component: TimeNavigationComponent;
  let fixture: ComponentFixture<TimeNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeNavigationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
