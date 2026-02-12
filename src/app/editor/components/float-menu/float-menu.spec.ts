import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatMenu } from './float-menu';

describe('FloatMenu', () => {
  let component: FloatMenu;
  let fixture: ComponentFixture<FloatMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloatMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
