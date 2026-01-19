import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tiptap } from './tiptap';

describe('Tiptap', () => {
  let component: Tiptap;
  let fixture: ComponentFixture<Tiptap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tiptap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tiptap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
