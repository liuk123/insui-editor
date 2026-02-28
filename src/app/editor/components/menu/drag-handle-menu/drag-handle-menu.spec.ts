import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragHandleMenu } from './drag-handle-menu';

describe('DragHandleMenu', () => {
  let component: DragHandleMenu;
  let fixture: ComponentFixture<DragHandleMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragHandleMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DragHandleMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
