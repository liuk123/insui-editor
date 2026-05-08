import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRowMenu } from './table-row-menu';

describe('TableRowMenu', () => {
  let component: TableRowMenu;
  let fixture: ComponentFixture<TableRowMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableRowMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableRowMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
