import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsDragHandle } from './drag-handle';

describe('DragHandle', () => {
  let component: InsDragHandle;
  let fixture: ComponentFixture<InsDragHandle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsDragHandle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsDragHandle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
