import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageMenu } from './image-menu';

describe('ImageMenu', () => {
  let component: ImageMenu;
  let fixture: ComponentFixture<ImageMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
