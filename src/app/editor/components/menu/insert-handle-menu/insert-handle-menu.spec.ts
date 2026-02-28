import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertHandleMenu } from './insert-handle-menu';

describe('InsertHandleMenu', () => {
  let component: InsertHandleMenu;
  let fixture: ComponentFixture<InsertHandleMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertHandleMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsertHandleMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
