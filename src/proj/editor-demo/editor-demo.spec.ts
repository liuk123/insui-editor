import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorDemo } from './editor-demo';

describe('EditorDemo', () => {
  let component: EditorDemo;
  let fixture: ComponentFixture<EditorDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorDemo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
