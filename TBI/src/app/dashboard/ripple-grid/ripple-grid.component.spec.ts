import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RippleGridComponent } from './ripple-grid.component';

describe('RippleGridComponent', () => {
  let component: RippleGridComponent;
  let fixture: ComponentFixture<RippleGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RippleGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RippleGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
